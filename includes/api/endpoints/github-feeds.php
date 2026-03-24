<?php
/**
 * Alpaca REST API: GitHub feeds endpoint.
 *
 * Provides cached data from the GitHub Atom feeds used by the About page.
 *
 * @package Alpaca
 */

add_action( 'rest_api_init', 'alpaca_register_github_feeds_endpoint' );
/**
 * Register GitHub feeds endpoint.
 */
function alpaca_register_github_feeds_endpoint() {
	register_rest_route(
		'alpaca/v1',
		'/github-feeds',
		array(
			'methods'             => 'GET',
			'callback'            => 'alpaca_get_github_feeds_callback',
			// Public read access; this endpoint only exposes public GitHub data and is cached server-side.
			'permission_callback' => '__return_true',
		)
	);
}

/**
 * Fetch and return cached GitHub Atom feed data.
 *
 * @return WP_REST_Response
 */
function alpaca_get_github_feeds_callback() {
	$cache_key = 'alpaca_github_feeds_v1';
	$cached    = get_transient( $cache_key );
	if ( is_array( $cached ) ) {
		return alpaca_rest_response( 'github_feeds', $cached, 200 );
	}

	$feeds = array(
		'releases'      => 'https://github.com/rareview/alpaca-beta/releases.atom',
		'announcements' => 'https://github.com/rareview/alpaca-beta/discussions/categories/announcements.atom',
	);

	$result = array();

	foreach ( $feeds as $key => $url ) {
		$res = wp_remote_get(
			$url,
			array(
				'timeout' => 5,
				'headers' => array(
					'User-Agent' => 'Alpaca-Plugin',
				),
			)
		);
		if ( is_wp_error( $res ) ) {
			$result[ $key ] = null;
			continue;
		}

		$body = wp_remote_retrieve_body( $res );
		if ( '' === $body ) {
			$result[ $key ] = null;
			continue;
		}

		// Parse Atom XML.
		libxml_use_internal_errors( true );
		$xml = simplexml_load_string( $body );
		if ( false === $xml ) {
			$result[ $key ] = null;
			continue;
		}

		// Namespaces and entries.
		$entries = $xml->entry;
		if ( ! isset( $entries ) || 0 === count( $entries ) ) {
			$result[ $key ] = null;
			continue;
		}

		// For announcements we want up to 3 latest items; for releases keep the first entry.
		if ( 'announcements' === $key ) {
			$items = array();
			$count = 0;
			foreach ( $entries as $entry ) {
				if ( $count >= 3 ) {
					break;
				}

				$title   = isset( $entry->title ) ? (string) $entry->title : '';
				$updated = isset( $entry->updated ) ? (string) $entry->updated : '';

				$link = '';
				if ( isset( $entry->link ) ) {
					foreach ( $entry->link as $lnk ) {
						$attrs = $lnk->attributes();
						if ( isset( $attrs['href'] ) && '' !== (string) $attrs['href'] ) {
							$link = (string) $attrs['href'];
							break;
						}
					}
				}

				$content = '';
				if ( isset( $entry->content ) && '' !== (string) $entry->content ) {
					$content = (string) $entry->content;
				} elseif ( isset( $entry->summary ) && '' !== (string) $entry->summary ) {
					$content = (string) $entry->summary;
				}

				$items[] = array(
					'title'   => $title,
					'updated' => $updated,
					'content' => $content,
					'link'    => $link,
				);

				++$count;
			}

			$result[ $key ] = $items;
		} else {
			$first = $entries[0];

			// Extract common fields for single-item feeds such as releases.
			$title   = isset( $first->title ) ? (string) $first->title : '';
			$updated = isset( $first->updated ) ? (string) $first->updated : '';

			$link = '';
			if ( isset( $first->link ) ) {
				foreach ( $first->link as $lnk ) {
					$attrs = $lnk->attributes();
					if ( isset( $attrs['href'] ) && '' !== (string) $attrs['href'] ) {
						$link = (string) $attrs['href'];
						break;
					}
				}
			}

			$content = '';
			if ( isset( $first->content ) && '' !== (string) $first->content ) {
				$content = (string) $first->content;
			} elseif ( isset( $first->summary ) && '' !== (string) $first->summary ) {
				$content = (string) $first->summary;
			}

			$result[ $key ] = array(
				'title'   => $title,
				'updated' => $updated,
				'content' => $content,
				'link'    => $link,
			);
		}
	}

	// Cache for 3 hours.
	set_transient( $cache_key, $result, 3 * HOUR_IN_SECONDS );

	return alpaca_rest_response( 'github_feeds', $result, 200 );
}
