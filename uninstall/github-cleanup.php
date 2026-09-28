<?php
/**
 * Remove Fix With AI files from GitHub when the plugin is uninstalled.
 *
 * WordPress only loads uninstall.php. That file calls this one before the
 * saved GitHub token is deleted.
 *
 * todo: I suspect a lot of helpers and functions from this file either already exists, or should be defined globally for the whole plugin. This redundancy should be resolved.
 *
 * @package AlpacaIssueTracker
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Branch that receives the Fix With AI workflow files during setup.
 *
 * Install and uninstall both use this name.
 *
 * @return string
 */
function alpaistr_agentic_get_config_branch_name(): string {
	return 'alpaca/ai-development';
}

/**
 * Branch used only when the default branch rejects a direct delete.
 *
 * @return string
 */
function alpaistr_uninstall_get_removal_branch_name(): string {
	return 'alpaca/remove-ai-development';
}

/**
 * Main function that delegates all the work.
 * It closes the setup pull request, deletes the config branch, and deletes installed files.
 *
 * Failures are logged and do not stop WordPress from finishing uninstall.
 *
 * @return void
 */
function alpaistr_uninstall_remove_github_agentic_config(): void {
	if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
		return;
	}

	$options = get_option( 'alpaistr_agentic_settings', [] );
	if ( ! is_array( $options ) ) {
		$options = [];
	}

	$token     = '';
	$repo_name = isset( $options['github_repo'] ) ? trim( (string) $options['github_repo'] ) : '';

	if ( defined( 'ALPAISTR_AGENTIC_GITHUB_TOKEN' ) ) {
		$token = trim( (string) ALPAISTR_AGENTIC_GITHUB_TOKEN );
	}
	if ( '' === $token && isset( $options['github_token'] ) ) {
		$token = trim( (string) $options['github_token'] );
	}

	if ( '' === $token || '' === $repo_name ) {
		return;
	}

	$repo = alpaistr_uninstall_extract_github_repo( $repo_name );
	if ( null === $repo ) {
		return;
	}

	$repo_info = alpaistr_uninstall_github_request( 'GET', alpaistr_uninstall_github_repo_api( $repo ), $token );
	if ( ! $repo_info['ok'] ) {
		alpaistr_uninstall_log_github_failure(
			'Could not reach GitHub during uninstall, so the Fix With AI branch and files were left in place. ' . alpaistr_uninstall_github_error_message( $repo_info )
		);
		return;
	}

	$default_branch = (string) ( $repo_info['data']['default_branch'] ?? '' );
	if ( '' === $default_branch ) {
		return;
	}

	$config_branch  = alpaistr_agentic_get_config_branch_name();
	$removal_branch = alpaistr_uninstall_get_removal_branch_name();

	// Close and delete the config branch.
	alpaistr_uninstall_close_branch_pull_requests( $token, $repo, $config_branch );
	alpaistr_uninstall_delete_git_branch( $token, $repo, $config_branch );

	// Drop a leftover removal branch from an earlier uninstall that could not push.
	alpaistr_uninstall_close_branch_pull_requests( $token, $repo, $removal_branch );
	alpaistr_uninstall_delete_git_branch( $token, $repo, $removal_branch );

	// Delete the installed files.
	$paths = alpaistr_uninstall_collect_installed_github_paths( dirname( __DIR__ ) . '/includes/agentic' );
	alpaistr_uninstall_delete_installed_files( $token, $repo, $default_branch, $paths );
	alpaistr_uninstall_delete_actions_variable( $token, $repo );
}

/**
 * GitHub paths for the configuration files in the repo.
 * During uninstall, these files will be removed.
 *
 * The skip list matches alpaistr_agentic_get_template_files().
 *
 * @param string $templates_dir Absolute path to includes/agentic.
 * @param string $base_path     Relative folder used while scanning. Empty on the first call.
 * @return string[] Paths relative to the repository root.
 */
function alpaistr_uninstall_collect_installed_github_paths( string $templates_dir, string $base_path = '' ): array {
	$templates_dir = rtrim( $templates_dir, '/\\' ) . '/';
	$paths         = [];

	if ( is_dir( $templates_dir ) ) {
		$entries = scandir( $templates_dir );
		if ( false !== $entries ) {
			// Keep this skip list in sync with alpaistr_agentic_get_template_files().
			$skip = [ '.', '..', 'index.php', '.DS_Store', 'draft-agent-ready-issue.md', 'security' ];

			foreach ( $entries as $entry ) {
				if ( in_array( $entry, $skip, true ) ) {
					continue;
				}

				$full = $templates_dir . $entry;
				$rel  = $base_path . $entry;

				if ( is_dir( $full ) ) {
					$paths = array_merge( $paths, alpaistr_uninstall_collect_installed_github_paths( $full, $rel . '/' ) );
				} elseif ( is_file( $full ) ) {
					$paths[] = '.github/' . $rel;
				}
			}
		}
	}

	if ( '' === $base_path ) {
		$agent_security = $templates_dir . 'security/agent.json';
		if ( is_readable( $agent_security ) ) {
			$paths[] = '.github/alpaca/security/agent.json';
		}
	}

	return array_values( array_unique( $paths ) );
}

/**
 * Extract the owner/repo part of the GitHub URL.
 *
 * @param string $repo Raw repository setting.
 * @return array{owner: string, name: string}|null
 */
function alpaistr_uninstall_extract_github_repo( string $repo ): array|null {
	$repo = trim( $repo );

	if ( str_contains( $repo, 'github.com' ) ) {
		$path = wp_parse_url( $repo, PHP_URL_PATH );
		$repo = trim( (string) $path, '/' );
	}

	$repo = (string) preg_replace( '/\.git$/', '', $repo );

	if ( ! preg_match( '#^([A-Za-z0-9_.-]+)/([A-Za-z0-9_.-]+)$#', $repo, $matches ) ) {
		return null;
	}

	return [
		'owner' => $matches[1],
		'name'  => $matches[2],
	];
}

/**
 * Call the GitHub REST API.
 *
 * @param string                    $method HTTP method.
 * @param string                    $url    Full API URL.
 * @param string                    $token  Personal access token.
 * @param array<string, mixed>|null $body   JSON body, or null when the request has none.
 * @return array{ok: bool, code: int, data: array<mixed>}
 */
function alpaistr_uninstall_github_request( string $method, string $url, string $token, array|null $body = null ): array {
	$args = [
		'method'  => $method,
		'timeout' => 20,
		'headers' => [
			'Authorization'        => 'Bearer ' . $token,
			'Accept'               => 'application/vnd.github+json',
			'Content-Type'         => 'application/json',
			'X-GitHub-Api-Version' => '2022-11-28',
			'User-Agent'           => 'AlpacaIssueTracker',
		],
	];

	if ( null !== $body ) {
		$encoded = wp_json_encode( $body );
		if ( false === $encoded ) {
			return [
				'ok'   => false,
				'code' => 0,
				'data' => [],
			];
		}
		$args['body'] = $encoded;
	}

	$response = wp_remote_request( $url, $args );
	if ( is_wp_error( $response ) ) {
		return [
			'ok'   => false,
			'code' => 0,
			'data' => [],
		];
	}

	$code = (int) wp_remote_retrieve_response_code( $response );
	$data = json_decode( wp_remote_retrieve_body( $response ), true );

	return [
		'ok'   => $code >= 200 && $code < 300,
		'code' => $code,
		'data' => is_array( $data ) ? $data : [],
	];
}

/**
 * Build a GitHub API request URL for the provided repo.
 *
 * @param array{owner: string, name: string} $repo   Parsed repository.
 * @param string                             $suffix Path after the repo name. Slashes are kept.
 * @return string
 */
function alpaistr_uninstall_github_repo_api( array $repo, string $suffix = '' ): string {
	$url = sprintf(
		'https://api.github.com/repos/%s/%s',
		rawurlencode( $repo['owner'] ),
		rawurlencode( $repo['name'] )
	);

	if ( '' !== $suffix ) {
		$url .= '/' . ltrim( $suffix, '/' );
	}

	return $url;
}

/**
 * Handle "/" characters in branch names and file paths.
 *
 * Branch names such as alpaca/ai-development must stay as real path segments.
 *
 * @param string $path Branch name or file path.
 * @return string
 */
function alpaistr_uninstall_encode_ref_path( string $path ): string {
	return implode( '/', array_map( 'rawurlencode', explode( '/', $path ) ) );
}

/**
 * It turns a GitHub API result into one short sentence for the PHP error log.
 *
 * @param array{ok: bool, code: int, data: array<mixed>} $response API result.
 * @return string
 */
function alpaistr_uninstall_github_error_message( array $response ): string {
	if ( 0 === $response['code'] ) {
		return 'Could not connect to GitHub.';
	}

	$message = isset( $response['data']['message'] ) ? (string) $response['data']['message'] : '';
	if ( '' === $message ) {
		return 'GitHub returned HTTP ' . (string) $response['code'] . '.';
	}

	return $message;
}

/**
 * Write a GitHub cleanup failure without the access token.
 *
 * @param string $message Error text.
 */
function alpaistr_uninstall_log_github_failure( string $message ): void {
	error_log( '[Alpaca] ' . $message ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
}

/**
 * Close open pull requests whose head branch is $branch.
 *
 * @param string                             $token  Personal access token.
 * @param array{owner: string, name: string} $repo   Parsed repository.
 * @param string                             $branch Head branch name.
 */
function alpaistr_uninstall_close_branch_pull_requests( string $token, array $repo, string $branch ): void {
	foreach ( alpaistr_uninstall_list_open_pull_request_numbers( $token, $repo, $branch ) as $number ) {
		alpaistr_uninstall_github_request(
			'PATCH',
			alpaistr_uninstall_github_repo_api( $repo, 'pulls/' . $number ),
			$token,
			[ 'state' => 'closed' ]
		);
	}
}

/**
 * Numbers of open pull requests from one head branch.
 *
 * @param string                             $token  Personal access token.
 * @param array{owner: string, name: string} $repo   Parsed repository.
 * @param string                             $branch Head branch name.
 * @return int[]
 */
function alpaistr_uninstall_list_open_pull_request_numbers( string $token, array $repo, string $branch ): array {
	$url      = add_query_arg(
		[
			'state'    => 'open',
			'head'     => $repo['owner'] . ':' . $branch,
			'per_page' => 20,
		],
		alpaistr_uninstall_github_repo_api( $repo, 'pulls' )
	);
	$response = alpaistr_uninstall_github_request( 'GET', $url, $token );
	if ( ! $response['ok'] ) {
		return [];
	}

	$numbers = [];
	foreach ( $response['data'] as $pull ) {
		if ( ! is_array( $pull ) || empty( $pull['number'] ) ) {
			continue;
		}
		$numbers[] = (int) $pull['number'];
	}

	return $numbers;
}

/**
 * Delete a branch ref. A missing branch is not an error.
 *
 * @param string                             $token  Personal access token.
 * @param array{owner: string, name: string} $repo   Parsed repository.
 * @param string                             $branch Branch name.
 */
function alpaistr_uninstall_delete_git_branch( string $token, array $repo, string $branch ): void {
	$response = alpaistr_uninstall_github_request(
		'DELETE',
		alpaistr_uninstall_github_repo_api( $repo, 'git/refs/heads/' . alpaistr_uninstall_encode_ref_path( $branch ) ),
		$token
	);

	if ( $response['ok'] || in_array( $response['code'], [ 404, 422 ], true ) ) {
		return;
	}

	alpaistr_uninstall_log_github_failure(
		'Could not delete branch ' . $branch . '. ' . alpaistr_uninstall_github_error_message( $response )
	);
}

/**
 * Remove installed files from the default branch in one commit.
 *
 * @param string                             $token          Personal access token.
 * @param array{owner: string, name: string} $repo           Parsed repository.
 * @param string                             $default_branch Repository default branch.
 * @param string[]                           $paths          Repository paths to delete when present.
 */
function alpaistr_uninstall_delete_installed_files( string $token, array $repo, string $default_branch, array $paths ): void {
	if ( empty( $paths ) ) {
		return;
	}

	$result = alpaistr_uninstall_create_deletion_commit( $token, $repo, $default_branch, $paths );
	if ( '' !== $result['error'] ) {
		alpaistr_uninstall_log_github_failure( $result['error'] );
		return;
	}
	if ( '' === $result['commit_sha'] ) {
		return;
	}

	alpaistr_uninstall_publish_deletion_commit( $token, $repo, $default_branch, $result['commit_sha'] );
}

/**
 * Prepares a commit that deletes the installed files.
 *
 * An empty commit SHA with an empty error means none of the files are on the branch.
 *
 * @param string                             $token  Personal access token.
 * @param array{owner: string, name: string} $repo   Parsed repository.
 * @param string                             $branch Branch that currently contains the files.
 * @param string[]                           $paths  Candidate paths.
 * @return array{commit_sha: string, error: string}
 */
function alpaistr_uninstall_create_deletion_commit( string $token, array $repo, string $branch, array $paths ): array {
	$empty = [
		'commit_sha' => '',
		'error'      => '',
	];

	$head = alpaistr_uninstall_get_branch_head( $token, $repo, $branch );
	if ( null === $head ) {
		$empty['error'] = 'Could not read branch ' . $branch . ' while removing Fix With AI files.';
		return $empty;
	}

	$present = alpaistr_uninstall_paths_present_on_branch( $token, $repo, $branch, $head['tree_sha'], $paths );
	if ( null === $present ) {
		$empty['error'] = 'Could not list Fix With AI files on branch ' . $branch . '.';
		return $empty;
	}
	if ( empty( $present ) ) {
		return $empty;
	}

	$tree_entries = [];
	foreach ( $present as $path ) {
		$tree_entries[] = [
			'path' => $path,
			'mode' => '100644',
			'type' => 'blob',
			'sha'  => null,
		];
	}

	// base_tree is required. Without it, GitHub treats every other file as deleted.
	$tree = alpaistr_uninstall_github_request(
		'POST',
		alpaistr_uninstall_github_repo_api( $repo, 'git/trees' ),
		$token,
		[
			'base_tree' => $head['tree_sha'],
			'tree'      => $tree_entries,
		]
	);

	$new_tree_sha = (string) ( $tree['data']['sha'] ?? '' );
	if ( ! $tree['ok'] || '' === $new_tree_sha ) {
		$empty['error'] = 'Could not prepare the commit that removes Fix With AI files. ' . alpaistr_uninstall_github_error_message( $tree );
		return $empty;
	}

	$commit = alpaistr_uninstall_github_request(
		'POST',
		alpaistr_uninstall_github_repo_api( $repo, 'git/commits' ),
		$token,
		[
			'message' => 'Remove Alpaca AI Development workflow [alpaca-ai-development]',
			'tree'    => $new_tree_sha,
			'parents' => [ $head['commit_sha'] ],
		]
	);

	$commit_sha = (string) ( $commit['data']['sha'] ?? '' );
	if ( ! $commit['ok'] || '' === $commit_sha ) {
		$empty['error'] = 'Could not create the commit that removes Fix With AI files. ' . alpaistr_uninstall_github_error_message( $commit );
		return $empty;
	}

	return [
		'commit_sha' => $commit_sha,
		'error'      => '',
	];
}

/**
 * Latest commit SHA and tree SHA for a branch.
 *
 * @param string                             $token  Personal access token.
 * @param array{owner: string, name: string} $repo   Parsed repository.
 * @param string                             $branch Branch name.
 * @return array{commit_sha: string, tree_sha: string}|null
 */
function alpaistr_uninstall_get_branch_head( string $token, array $repo, string $branch ): array|null {
	$response = alpaistr_uninstall_github_request(
		'GET',
		alpaistr_uninstall_github_repo_api( $repo, 'branches/' . alpaistr_uninstall_encode_ref_path( $branch ) ),
		$token
	);
	if ( ! $response['ok'] ) {
		return null;
	}

	$commit_sha = (string) ( $response['data']['commit']['sha'] ?? '' );
	$tree_sha   = (string) ( $response['data']['commit']['commit']['tree']['sha'] ?? '' );
	if ( '' === $commit_sha || '' === $tree_sha ) {
		return null;
	}

	return [
		'commit_sha' => $commit_sha,
		'tree_sha'   => $tree_sha,
	];
}

/**
 * GitHub only allows deleting files that exists. Trying to delete a missing file ends up with failed commit. So the check is required first.
 *
 * Null means the lookup failed. An empty list means none of the files are present.
 *
 * @param string                             $token    Personal access token.
 * @param array{owner: string, name: string} $repo     Parsed repository.
 * @param string                             $branch   Branch name.
 * @param string                             $tree_sha Tree SHA of the branch head.
 * @param string[]                           $paths    Candidate paths.
 * @return string[]|null
 */
function alpaistr_uninstall_paths_present_on_branch( string $token, array $repo, string $branch, string $tree_sha, array $paths ): array|null {
	$url      = add_query_arg(
		'recursive',
		'1',
		alpaistr_uninstall_github_repo_api( $repo, 'git/trees/' . $tree_sha )
	);
	$response = alpaistr_uninstall_github_request( 'GET', $url, $token );
	if ( ! $response['ok'] ) {
		return null;
	}

	if ( empty( $response['data']['truncated'] ) ) {
		$present = [];
		foreach ( (array) ( $response['data']['tree'] ?? [] ) as $item ) {
			if ( ! is_array( $item ) || 'blob' !== ( $item['type'] ?? '' ) ) {
				continue;
			}
			$present[ (string) ( $item['path'] ?? '' ) ] = true;
		}

		$found = [];
		foreach ( $paths as $path ) {
			if ( isset( $present[ $path ] ) ) {
				$found[] = $path;
			}
		}
		return $found;
	}

	$found = [];
	foreach ( $paths as $path ) {
		$file_url = add_query_arg(
			'ref',
			$branch,
			alpaistr_uninstall_github_repo_api( $repo, 'contents/' . alpaistr_uninstall_encode_ref_path( $path ) )
		);
		$file     = alpaistr_uninstall_github_request( 'GET', $file_url, $token );
		if ( $file['ok'] && isset( $file['data']['path'] ) ) {
			$found[] = $path;
			continue;
		}
		if ( 404 !== $file['code'] ) {
			return null;
		}
	}

	return $found;
}

/**
 * Put the deletion commit on the default branch, or open a pull request.
 *
 * @param string                             $token          Personal access token.
 * @param array{owner: string, name: string} $repo           Parsed repository.
 * @param string                             $default_branch Repository default branch.
 * @param string                             $commit_sha     Deletion commit SHA.
 */
function alpaistr_uninstall_publish_deletion_commit( string $token, array $repo, string $default_branch, string $commit_sha ): void {
	$updated = alpaistr_uninstall_github_request(
		'PATCH',
		alpaistr_uninstall_github_repo_api( $repo, 'git/refs/heads/' . alpaistr_uninstall_encode_ref_path( $default_branch ) ),
		$token,
		[ 'sha' => $commit_sha ]
	);
	if ( $updated['ok'] ) {
		return;
	}

	$removal_branch = alpaistr_uninstall_get_removal_branch_name();
	$pointed        = alpaistr_uninstall_point_branch_at_commit( $token, $repo, $removal_branch, $commit_sha );
	if ( ! $pointed ) {
		alpaistr_uninstall_log_github_failure(
			'Could not remove Fix With AI files from ' . $default_branch . '. ' . alpaistr_uninstall_github_error_message( $updated )
		);
		return;
	}

	$numbers = alpaistr_uninstall_list_open_pull_request_numbers( $token, $repo, $removal_branch );
	$number  = $numbers[0] ?? 0;
	if ( 0 === $number ) {
		$pull   = alpaistr_uninstall_github_request(
			'POST',
			alpaistr_uninstall_github_repo_api( $repo, 'pulls' ),
			$token,
			[
				'title' => 'Remove Alpaca AI Development workflow',
				'head'  => $removal_branch,
				'base'  => $default_branch,
				'body'  => "Alpaca Issue Tracker was uninstalled.\n\nThis pull request removes the Fix With AI workflow files and config that the plugin added under `.github/`.\n\nGitHub did not allow deleting them directly on `{$default_branch}`. Merge this pull request so a later install can add the current files.\n",
			]
		);
		$number = (int) ( $pull['data']['number'] ?? 0 );
		if ( ! $pull['ok'] || 0 === $number ) {
			alpaistr_uninstall_log_github_failure(
				'Could not open a pull request to remove Fix With AI files. ' . alpaistr_uninstall_github_error_message( $pull )
			);
			return;
		}
	}

	if ( alpaistr_uninstall_merge_pull_request( $token, $repo, $number ) ) {
		alpaistr_uninstall_delete_git_branch( $token, $repo, $removal_branch );
		return;
	}

	$pull_url = sprintf( 'https://github.com/%s/%s/pull/%d', $repo['owner'], $repo['name'], $number );
	alpaistr_uninstall_log_github_failure(
		'Opened ' . $pull_url . ' to remove Fix With AI files because ' . $default_branch . ' rejected a direct push. Merge that pull request before installing the plugin again.'
	);
}

/**
 * This points a branch to a provided commit. It either creates the new branch, or moves it to the provided SHA if it already exists.
 *
 * Force is used only for the plugin's own removal branch.
 *
 * @param string                             $token      Personal access token.
 * @param array{owner: string, name: string} $repo       Parsed repository.
 * @param string                             $branch     Branch name.
 * @param string                             $commit_sha Commit SHA.
 * @return bool
 */
function alpaistr_uninstall_point_branch_at_commit( string $token, array $repo, string $branch, string $commit_sha ): bool {
	$created = alpaistr_uninstall_github_request(
		'POST',
		alpaistr_uninstall_github_repo_api( $repo, 'git/refs' ),
		$token,
		[
			'ref' => 'refs/heads/' . $branch,
			'sha' => $commit_sha,
		]
	);
	if ( $created['ok'] ) {
		return true;
	}

	$updated = alpaistr_uninstall_github_request(
		'PATCH',
		alpaistr_uninstall_github_repo_api( $repo, 'git/refs/heads/' . alpaistr_uninstall_encode_ref_path( $branch ) ),
		$token,
		[
			'sha'   => $commit_sha,
			'force' => true,
		]
	);

	return $updated['ok'];
}

/**
 * Finally merge a pull request using whichever method the repository allows.
 *
 * @param string                             $token  Personal access token.
 * @param array{owner: string, name: string} $repo   Parsed repository.
 * @param int                                $number Pull request number.
 * @return bool
 */
function alpaistr_uninstall_merge_pull_request( string $token, array $repo, int $number ): bool {
	foreach ( [ 'merge', 'squash', 'rebase' ] as $method ) {
		$response = alpaistr_uninstall_github_request(
			'PUT',
			alpaistr_uninstall_github_repo_api( $repo, 'pulls/' . $number . '/merge' ),
			$token,
			[
				'merge_method' => $method,
				'commit_title' => 'Remove Alpaca AI Development workflow [alpaca-ai-development]',
			]
		);
		if ( $response['ok'] ) {
			return true;
		}
	}

	return false;
}

/**
 * Delete the Actions variable ALPACA_AI_TARGET_BRANCH, that is generated during the setup process.
 *
 * @param string                             $token Personal access token.
 * @param array{owner: string, name: string} $repo  Parsed repository.
 */
function alpaistr_uninstall_delete_actions_variable( string $token, array $repo ): void {
	$response = alpaistr_uninstall_github_request(
		'DELETE',
		alpaistr_uninstall_github_repo_api( $repo, 'actions/variables/ALPACA_AI_TARGET_BRANCH' ),
		$token
	);

	if ( $response['ok'] || 404 === $response['code'] ) {
		return;
	}

	alpaistr_uninstall_log_github_failure(
		'Could not delete the ALPACA_AI_TARGET_BRANCH Actions variable. ' . alpaistr_uninstall_github_error_message( $response )
	);
}
