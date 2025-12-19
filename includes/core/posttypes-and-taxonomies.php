<?php
/**
 * Post types and taxonomies registration for Alpaca issues.
 *
 * @package Alpaca
 */

/**
 * Register a taxonomy with optional custom arguments.
 *
 * @param string $slug       Taxonomy slug.
 * @param array  $customargs Custom arguments to merge with defaults.
 */
function alpaca_register_taxonomy( $slug, $customargs = array() ) {
	$defaults = array(
		'public'             => true,
		'publicly_queryable' => false,
		'label'              => $slug,
		'hierarchical'       => false,
	);
	$args     = array_merge( $defaults, $customargs );
	register_taxonomy( $slug, 'alpaca_issue', $args );
}

/**
 * Register custom post types and taxonomies for Alpaca.
 */
function alpaca_register_cpts_and_taxonomies() {

	register_term_meta(
		'alpaca_status',
		'term_score',
		array(
			'type'         => 'number',
			'description'  => 'A score for ordering statuses on the board.',
			'single'       => true,
			'show_in_rest' => true,
			'default'      => 0,
		)
	);

	register_post_type(
		'alpaca_issue',
		array(
			'public'        => false,
			'show_in_rest'  => true,
			'show_ui'       => true,
			'label'         => 'Issues',
			'labels'        => array(
				'name'          => 'Issue',
				'singular_name' => 'Issue',
				'all_items'     => 'All Issues',
				'edit_item'     => 'Edit Issue',
				'view_item'     => 'View Issue',
				'view_items'    => 'View Issues',
			),
			'menu_icon'     => 'dashicons-warning',
			'menu_position' => 102,
			'supports'      => array( 'editor', 'custom-fields', 'author', 'comments' ),
			'map_meta_cap'  => true,
		)
	);

	alpaca_register_taxonomy( 'alpaca_browser', array( 'label' => 'Browser' ) );
	alpaca_register_taxonomy( 'alpaca_phptemplate', array( 'label' => 'PHP Template' ) );
	alpaca_register_taxonomy( 'alpaca_type', array( 'label' => 'Type' ) );
	alpaca_register_taxonomy(
		'alpaca_assignee',
		array(
			'public' => true,
			'label'  => 'Assignee',
		)
	);
	alpaca_register_taxonomy(
		'alpaca_status',
		array(
			'show_in_rest' => true,
			'meta_box_cb'  => 'alpaca_status_metabox',
			'label'        => 'Status',
		)
	);

	add_filter(
		'rest_pre_insert_comment',
		function ( $prepared_comment, $request ) {
			if ( isset( $request['comment_type'] ) && 'issuecomment' === $request['comment_type'] ) {
				$prepared_comment['comment_type'] = 'issuecomment';
			}

			if ( isset( $request['author_user_agent'] ) ) {
				$prepared_comment['comment_agent'] = sanitize_text_field( $request['author_user_agent'] );
			}

			return $prepared_comment;
		},
		10,
		2
	);

	add_filter(
		'rest_comment_query',
		function ( $args, $request ) {
			if ( isset( $request['comment_type'] ) && 'issuecomment' === $request['comment_type'] ) {
				$args['type'] = 'issuecomment';
			}
			return $args;
		},
		10,
		2
	);

	add_filter(
		'comments_open',
		function ( $open, $post_id ) {
			$post = get_post( $post_id );
			if ( $post && 'alpaca_issue' === $post->post_type ) {
				return true;
			}
			return $open;
		},
		10,
		2
	);

	add_action(
		'alpaca_status_add_form_fields',
		function () {
			wp_nonce_field( 'alpaca_status_meta_add', 'alpaca_status_nonce' );
			?>
		<div class="form-field">
			<label for="term_score"><?php esc_html_e( 'Score', 'alpaca' ); ?></label>
			<input type="number" name="term_score" id="term_score" value="" step="1" min="0">
			<p class="description"><?php esc_html_e( 'Enter a numerical score for sorting purposes.', 'alpaca' ); ?></p>
		</div>
			<?php
		}
	);

	add_action(
		'alpaca_status_edit_form_fields',
		function ( $term ) {
			$score = get_term_meta( $term->term_id, 'term_score', true );
			wp_nonce_field( 'alpaca_status_meta_edit', 'alpaca_status_nonce' );
			?>
		<tr class="form-field">
			<th scope="row"><label for="term_score"><?php esc_html_e( 'Score', 'alpaca' ); ?></label></th>
			<td>
				<input type="number" name="term_score" id="term_score" value="<?php echo esc_attr( $score ); ?>" step="1">
				<p class="description"><?php esc_html_e( 'Enter a numerical score for sorting purposes.', 'alpaca' ); ?></p>
			</td>
		</tr>
			<?php
		},
		10,
		1
	);

	// Save term meta when creating or editing.
	/**
	 * Save status term score when status is created or edited.
	 *
	 * @param int $term_id Term ID.
	 */
	function alpaca_save_status_term_score( $term_id ) {
		// Verify nonce for security.
		if ( ! isset( $_POST['alpaca_status_nonce'] ) ) {
			return;
		}

		// Sanitize and unslash nonce.
		$nonce = sanitize_text_field( wp_unslash( $_POST['alpaca_status_nonce'] ) );

		// Check nonce validity (handles both add and edit actions).
		$nonce_add  = wp_verify_nonce( $nonce, 'alpaca_status_meta_add' );
		$nonce_edit = wp_verify_nonce( $nonce, 'alpaca_status_meta_edit' );

		if ( ! $nonce_add && ! $nonce_edit ) {
			return;
		}

		// Check user capabilities.
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		// Save term score.
		if ( isset( $_POST['term_score'] ) ) {
			$score = intval( $_POST['term_score'] );
			update_term_meta( $term_id, 'term_score', $score );
		}
	}
	add_action( 'created_alpaca_status', 'alpaca_save_status_term_score' );
	add_action( 'edited_alpaca_status', 'alpaca_save_status_term_score' );

	// Add new column header.
	add_filter(
		'manage_edit-alpaca_status_columns',
		function ( $columns ) {
			$columns['term_score'] = __( 'Score', 'alpaca' );
			return $columns;
		}
	);

	// Fill the column content.
	add_filter(
		'manage_alpaca_status_custom_column',
		function ( $content, $column_name, $term_id ) {
			if ( 'term_score' === $column_name ) {
				$score   = get_term_meta( $term_id, 'term_score', true );
				$content = '' !== $score ? intval( $score ) : '—';
			}
			return $content;
		},
		10,
		3
	);
	add_filter(
		'manage_edit-alpaca_status_sortable_columns',
		function ( $sortable_columns ) {
			$sortable_columns['term_score'] = 'term_score';
			return $sortable_columns;
		}
	);

	/**
	 * Custom metabox for status taxonomy.
	 * Inspired by: https://wordpress.stackexchange.com/questions/50077/display-a-custom-taxonomy-as-a-dropdown-on-the-edit-posts-page
	 *
	 * @param WP_Post $post Post object.
	 */
	function alpaca_status_metabox( $post ) {
		$current_terms   = wp_get_post_terms( $post->ID, 'alpaca_status', array( 'fields' => 'ids' ) );
		$current_term_id = ! empty( $current_terms ) ? $current_terms[0] : 0;

		$terms = alpaca_get_statuses();

		echo '<div class="statuses_radiolist">';
		foreach ( $terms as $term ) {
			$checked = ( $current_term_id === $term->term_id ) ? 'checked' : '';
			echo '<label><input type="radio" name="tax_input[alpaca_status][]" value="' . esc_attr( $term->slug ) . '" ' . esc_attr( $checked ) . '/> ' . esc_html( $term->name ) . '</label><br>';
		}
		echo '</div>';
	}
}
add_action( 'init', 'alpaca_register_cpts_and_taxonomies' );

add_filter(
	'alpaca_board_statuses',
	function ( $statuses ) {
		$desired_statuses = array();
		foreach ( $statuses as $status ) {
			// Filter out statuses outside the visible range.
			if ( $status->term_score > alpaca_get_max_term_score() ) {
				continue;
			}
			if ( $status->term_score < alpaca_get_min_term_score() ) {
				continue;
			}
			$desired_statuses[] = $status;
		}
		return $desired_statuses;
	}
);

/**
 * Update assignee term name when user profile is updated.
 *
 * When a user's profile is updated, find the corresponding 'assignee' term
 * and update its name to match the user's new display name.
 * The link between a user and an assignee term is the user's nicename (slug).
 *
 * @param int    $user_id       The ID of the user being updated.
 * @param object $old_user_data The old user data.
 */
function alpaca_update_assignee_term_on_profile_update( $user_id, $old_user_data ) {
	$user = get_userdata( $user_id );

	// No need to do anything if the display name hasn't changed.
	if ( $user->display_name === $old_user_data->display_name ) {
		return;
	}

	// Find the term in the 'assignee' taxonomy with a slug that matches the user's nicename.
	$term = get_term_by( 'slug', $user->user_nicename, 'alpaca_assignee' );

	// If a term is found, update its name to the user's new display name.
	if ( $term ) {
		wp_update_term( $term->term_id, 'alpaca_assignee', array( 'name' => $user->display_name ) );
	}
}
add_action( 'profile_update', 'alpaca_update_assignee_term_on_profile_update', 10, 2 );

/**
 * Get statuses ordered by score.
 *
 * @param string $order Sort order (ASC or DESC).
 * @return array Array of status terms.
 */
function alpaca_get_statuses( $order = 'ASC' ) {
	$terms = get_terms(
		array(
			'taxonomy'   => 'alpaca_status',
			'hide_empty' => false,
			// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
			'meta_key'   => 'term_score',
			'orderby'    => 'meta_value_num',
			'order'      => $order,
		)
	);
	if ( empty( $terms )
		|| ! is_array( $terms )
		|| is_wp_error( $terms )
	) {
		return array();
	}
	foreach ( $terms as $term ) {
		$score            = get_term_meta( $term->term_id, 'term_score', true );
		$term->term_score = $score;
	}
	return $terms;
}
