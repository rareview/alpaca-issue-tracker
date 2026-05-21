<?php

/**
 * Notification template helpers for Alpaca Issue Tracker issue activity emails.
 *
 * @package AlpacaIssueTracker
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Return the default email subject template.
 *
 * @return string Subject template.
 */
function alpaistr_get_notification_email_subject_template_default() {
	return '[{{site_title}}] [{{issue_title}}] {{event_label}}';
}

/**
 * Return the legacy default email subject template.
 *
 * @return string Legacy subject template.
 */
function alpaistr_get_notification_email_subject_template_legacy_default() {
	return '[Alpaca] {{issue_title}} updated';
}

/**
 * Return the default email body template.
 *
 * @return string Serialized block content.
 */
function alpaistr_get_notification_email_body_template_default() {
	return implode(
		"\n",
		[
			'<!-- wp:group {"className":"alpaca-notification-header","layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"}} -->',
			'<div class="wp-block-group alpaca-notification-header">',
			'<!-- wp:alpaca/email-site-logo /-->',
			'<!-- wp:group {"className":"alpaca-notification-header__copy","layout":{"type":"constrained"}} -->',
			'<div class="wp-block-group alpaca-notification-header__copy">',
			'<!-- wp:paragraph {"className":"alpaca-notification-header__title"} -->',
			'<p class="alpaca-notification-header__title">{{site_title}}</p>',
			'<!-- /wp:paragraph -->',
			'<!-- wp:paragraph {"fontSize":"small","className":"alpaca-notification-header__tagline"} -->',
			'<p class="alpaca-notification-header__tagline has-small-font-size">{{site_tagline}}</p>',
			'<!-- /wp:paragraph -->',
			'</div>',
			'<!-- /wp:group -->',
			'</div>',
			'<!-- /wp:group -->',
			'<!-- wp:heading {"level":2} -->',
			'<h2>{{issue_title}}</h2>',
			'<!-- /wp:heading -->',
			'<!-- wp:paragraph -->',
			'<p>{{event_label}}</p>',
			'<!-- /wp:paragraph -->',
			'<!-- wp:paragraph -->',
			'<p>By {{performed_by}}</p>',
			'<!-- /wp:paragraph -->',
			'<!-- wp:alpaca/email-comment-content {"lock":{"move":false,"remove":true}} /-->',
			'<!-- wp:buttons -->',
			'<div class="wp-block-buttons"><!-- wp:button --><div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="{{issue_url}}">Open Issue</a></div><!-- /wp:button --></div>',
			'<!-- /wp:buttons -->',
			'<!-- wp:separator -->',
			'<hr class="wp-block-separator has-alpha-channel-opacity"/>',
			'<!-- /wp:separator -->',
			'<!-- wp:paragraph {"fontSize":"small"} -->',
			'<p class="has-small-font-size">{{event_time}}</p>',
			'<!-- /wp:paragraph -->',
			'<!-- wp:paragraph {"fontSize":"small"} -->',
			'<p class="has-small-font-size"><a href="{{notifications_url}}">' . esc_html__( 'Manage notifications', 'alpaca-issue-tracker' ) . '</a></p>',
			'<!-- /wp:paragraph -->',
		]
	);
}

/**
 * Return the legacy default email body template.
 *
 * @return string Legacy serialized block content.
 */
function alpaistr_get_notification_email_body_template_legacy_default() {
	return implode(
		"\n",
		[
			'<!-- wp:heading {"level":2} -->',
			'<h2>{{issue_title}}</h2>',
			'<!-- /wp:heading -->',
			'<!-- wp:paragraph -->',
			'<p>{{event_label}}</p>',
			'<!-- /wp:paragraph -->',
			'<!-- wp:paragraph -->',
			'<p>By {{actor_name}}</p>',
			'<!-- /wp:paragraph -->',
			'<!-- wp:alpaca/email-comment-content /-->',
			'<!-- wp:buttons -->',
			'<div class="wp-block-buttons"><!-- wp:button --><div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="{{issue_url}}">Open Issue</a></div><!-- /wp:button --></div>',
			'<!-- /wp:buttons -->',
			'<!-- wp:separator -->',
			'<hr class="wp-block-separator has-alpha-channel-opacity"/>',
			'<!-- /wp:separator -->',
			'<!-- wp:paragraph {"fontSize":"small"} -->',
			'<p class="has-small-font-size">{{site_name}} · {{event_time}}</p>',
			'<!-- /wp:paragraph -->',
			'<!-- wp:paragraph {"fontSize":"small"} -->',
			'<p class="has-small-font-size"><a href="{{notifications_url}}">' . esc_html__( 'Manage notifications', 'alpaca-issue-tracker' ) . '</a></p>',
			'<!-- /wp:paragraph -->',
		]
	);
}

/**
 * Sanitize structured notification context saved on comment meta.
 *
 * @param mixed $value Raw meta value.
 * @return array<string, mixed> Sanitized context array.
 */
function alpaistr_sanitize_notification_context_meta( $value ) {
	if ( ! is_array( $value ) ) {
		return [];
	}

	$sanitized = [];

	if ( isset( $value['action'] ) ) {
		$sanitized['action'] = sanitize_key( (string) $value['action'] );
	}

	if ( isset( $value['affected_user_ids'] ) && is_array( $value['affected_user_ids'] ) ) {
		$sanitized['affected_user_ids'] = array_values(
			array_unique(
				array_filter(
					array_map( 'absint', $value['affected_user_ids'] )
				)
			)
		);
	}

	if ( isset( $value['subissue_id'] ) ) {
		$sanitized['subissue_id'] = absint( $value['subissue_id'] );
	}

	if ( isset( $value['subissue_title'] ) ) {
		$sanitized['subissue_title'] = sanitize_text_field( (string) $value['subissue_title'] );
	}

	return $sanitized;
}

/**
 * Return the allowed core block names for notification templates.
 *
 * @return string[] Allowed core block names.
 */
function alpaistr_get_notification_template_allowed_core_blocks() {
	return [
		'core/paragraph',
		'core/heading',
		'core/list',
		'core/list-item',
		'core/separator',
		'core/spacer',
		'core/group',
		'core/buttons',
		'core/button',
		'core/image',
	];
}

/**
 * Return the full block allow-list for a notification template.
 *
 * @param array<int, string> $allowed_blocks Template-specific allowed blocks.
 * @return string[] Allowed block names.
 */
function alpaistr_get_notification_template_allowed_block_types_for_blocks( $allowed_blocks ) {
	$normalized_blocks = [];

	if ( is_array( $allowed_blocks ) ) {
		foreach ( $allowed_blocks as $block_name ) {
			if ( ! is_string( $block_name ) ) {
				continue;
			}

			$block_name = trim( $block_name );
			if ( '' === $block_name ) {
				continue;
			}

			$normalized_blocks[] = $block_name;
		}
	}

	return array_values(
		array_unique(
			array_merge(
				alpaistr_get_notification_template_allowed_core_blocks(),
				$normalized_blocks
			)
		)
	);
}

/**
 * Determine whether a block is allowed in a notification template.
 *
 * @param string             $block_name          Block name.
 * @param array<int, string> $allowed_block_types Allowed block names.
 * @return bool True when the block is allowed.
 */
function alpaistr_notification_template_block_is_allowed_for_types( $block_name, $allowed_block_types ) {
	$block_name = is_string( $block_name ) ? trim( $block_name ) : '';
	if ( '' === $block_name ) {
		return false;
	}

	return in_array( $block_name, $allowed_block_types, true );
}

/**
 * Determine whether a parsed block tree contains a specific block.
 *
 * @param array<int, array<string, mixed>> $blocks      Parsed blocks.
 * @param string                           $target_name Block name to locate.
 * @return bool True when the block is present.
 */
function alpaistr_notification_template_has_block( $blocks, $target_name ) {
	foreach ( $blocks as $block ) {
		$block_name = isset( $block['blockName'] ) ? (string) $block['blockName'] : '';
		if ( $target_name === $block_name ) {
			return true;
		}

		$inner_blocks = isset( $block['innerBlocks'] ) && is_array( $block['innerBlocks'] ) ? $block['innerBlocks'] : [];
		if ( ! empty( $inner_blocks ) && alpaistr_notification_template_has_block( $inner_blocks, $target_name ) ) {
			return true;
		}
	}

	return false;
}

/**
 * Determine whether a parsed block tree includes all required blocks.
 *
 * @param array<int, array<string, mixed>> $blocks               Parsed blocks.
 * @param array<int, string>               $required_block_names Required block names.
 * @return bool True when all required blocks are present.
 */
function alpaistr_notification_template_has_required_blocks( $blocks, $required_block_names ) {
	if ( ! is_array( $required_block_names ) || empty( $required_block_names ) ) {
		return true;
	}

	foreach ( $required_block_names as $block_name ) {
		if ( ! is_string( $block_name ) || '' === trim( $block_name ) ) {
			continue;
		}

		if ( ! alpaistr_notification_template_has_block( $blocks, $block_name ) ) {
			return false;
		}
	}

	return true;
}

/**
 * Filter parsed blocks to an allowed notification template block set.
 *
 * @param array<int, array<string, mixed>> $blocks               Parsed blocks.
 * @param array<int, string>               $allowed_block_types  Allowed block names.
 * @param callable|null                    $normalize_callback   Optional block normalization callback.
 * @param callable|null                    $should_remove_callback Optional block removal callback.
 * @return array<int, array<string, mixed>> Filtered blocks.
 */
function alpaistr_filter_notification_template_blocks_with_callbacks( $blocks, $allowed_block_types, $normalize_callback = null, $should_remove_callback = null ) {
	$filtered = [];

	foreach ( $blocks as $block ) {
		$block_name = isset( $block['blockName'] ) ? (string) $block['blockName'] : '';
		if ( '' === $block_name ) {
			continue;
		}

		if ( ! alpaistr_notification_template_block_is_allowed_for_types( $block_name, $allowed_block_types ) ) {
			continue;
		}

		$block['innerBlocks'] = isset( $block['innerBlocks'] ) && is_array( $block['innerBlocks'] )
			? alpaistr_filter_notification_template_blocks_with_callbacks( $block['innerBlocks'], $allowed_block_types, $normalize_callback, $should_remove_callback )
			: [];

		if ( is_callable( $normalize_callback ) ) {
			$block = call_user_func( $normalize_callback, $block );
		}

		if ( ! is_array( $block ) ) {
			continue;
		}

		if ( is_callable( $should_remove_callback ) && call_user_func( $should_remove_callback, $block ) ) {
			continue;
		}

		$filtered[] = $block;
	}

	return $filtered;
}

/**
 * Normalize a serialized notification template body.
 *
 * @param string             $body                  Serialized block content.
 * @param string             $default_body          Default serialized body template.
 * @param array<int, string> $allowed_block_types   Allowed block names.
 * @param callable|null      $normalize_callback    Optional block normalization callback.
 * @param callable|null      $should_remove_callback Optional block removal callback.
 * @param callable|null      $reset_to_default_callback Optional callback that forces a reset to default.
 * @return string Normalized serialized block content.
 */
function alpaistr_normalize_notification_template_body_with_callbacks( $body, $default_body, $allowed_block_types, $normalize_callback = null, $should_remove_callback = null, $reset_to_default_callback = null ) {
	$body = is_string( $body ) ? trim( $body ) : '';

	if ( '' === $body ) {
		$body = $default_body;
	}

	$blocks   = parse_blocks( $body );
	$filtered = alpaistr_filter_notification_template_blocks_with_callbacks( $blocks, $allowed_block_types, $normalize_callback, $should_remove_callback );

	if ( empty( $filtered ) ) {
		return $default_body;
	}

	if ( is_callable( $reset_to_default_callback ) && call_user_func( $reset_to_default_callback, $filtered ) ) {
		return $default_body;
	}

	return serialize_blocks( $filtered );
}

/**
 * Sanitize a notification template subject.
 *
 * @param string $subject         Subject template.
 * @param string $default_subject Default subject template.
 * @return string Sanitized subject template.
 */
function alpaistr_sanitize_notification_template_subject( $subject, $default_subject ) {
	$subject = is_string( $subject ) ? trim( wp_strip_all_tags( $subject ) ) : '';

	if ( '' === $subject ) {
		return $default_subject;
	}

	return $subject;
}

/**
 * Sanitize a notification template body and validate required blocks.
 *
 * @param string             $body                  Serialized block content.
 * @param string             $default_body          Default serialized body template.
 * @param array<int, string> $allowed_block_types   Allowed block names.
 * @param callable|null      $normalize_callback    Optional block normalization callback.
 * @param callable|null      $should_remove_callback Optional block removal callback.
 * @param array<int, string> $required_block_names Required block names.
 * @param string             $empty_error_code      Error code for an empty template.
 * @param string             $empty_error_message   Error message for an empty template.
 * @param string             $required_error_code   Error code for missing required blocks.
 * @param string             $required_error_message Error message for missing required blocks.
 * @return string|WP_Error Sanitized body string or WP_Error on failure.
 */
function alpaistr_sanitize_notification_template_body_with_callbacks( $body, $default_body, $allowed_block_types, $normalize_callback = null, $should_remove_callback = null, $required_block_names = [], $empty_error_code = '', $empty_error_message = '', $required_error_code = '', $required_error_message = '' ) {
	$body = is_string( $body ) ? trim( $body ) : '';
	if ( '' === $body ) {
		$body = $default_body;
	}

	$blocks   = parse_blocks( $body );
	$filtered = alpaistr_filter_notification_template_blocks_with_callbacks( $blocks, $allowed_block_types, $normalize_callback, $should_remove_callback );

	if ( empty( $filtered ) ) {
		return new WP_Error(
			$empty_error_code,
			$empty_error_message,
			[ 'status' => 400 ]
		);
	}

	if ( ! alpaistr_notification_template_has_required_blocks( $filtered, $required_block_names ) ) {
		return new WP_Error(
			$required_error_code,
			$required_error_message,
			[ 'status' => 400 ]
		);
	}

	return serialize_blocks( $filtered );
}

/**
 * Return the Alpaca Issue Tracker placeholder block names for the email template editor.
 *
 * @return string[] Allowed placeholder block names.
 */
function alpaistr_get_notification_template_allowed_blocks() {
	return [
		'alpaca/email-issue-title',
		'alpaca/email-actor-name',
		'alpaca/email-event-label',
		'alpaca/email-comment-content',
		'alpaca/email-issue-link',
		'alpaca/email-site-name',
		'alpaca/email-site-tagline',
		'alpaca/email-site-logo',
		'alpaca/email-event-time',
	];
}

/**
 * Return the full block allow-list for the email template editor.
 *
 * @return string[] Allowed block names.
 */
function alpaistr_get_notification_template_allowed_block_types() {
	return alpaistr_get_notification_template_allowed_block_types_for_blocks(
		alpaistr_get_notification_template_allowed_blocks()
	);
}

/**
 * Get the current site icon URL for notification emails.
 *
 * @return string Site icon URL.
 */
function alpaistr_get_notification_site_icon_url() {
	$icon_url = get_site_icon_url( 512 );

	return is_string( $icon_url ) ? $icon_url : '';
}

/**
 * Get the current user's notifications page URL.
 *
 * @return string Notifications page URL.
 */
function alpaistr_get_notification_preferences_url() {
	return admin_url( 'admin.php?page=alpaca-notifications' );
}

/**
 * Get the saved notification email template.
 *
 * @return array<string, mixed> Saved template values.
 */
function alpaistr_get_notification_email_template() {
	$subject = get_option( 'alpaistr_notification_email_subject_template', '' );
	$body    = get_option( 'alpaistr_notification_email_body_template', '' );

	if ( ! is_string( $subject ) || '' === $subject ) {
		$subject = alpaistr_get_notification_email_subject_template_default();
	} elseif ( alpaistr_get_notification_email_subject_template_legacy_default() === $subject ) {
		$subject = alpaistr_get_notification_email_subject_template_default();
	}

	if ( ! is_string( $body ) || '' === $body ) {
		$body = alpaistr_get_notification_email_body_template_default();
	} elseif ( alpaistr_get_notification_email_body_template_legacy_default() === $body ) {
		$body = alpaistr_get_notification_email_body_template_default();
	}

	$body = alpaistr_normalize_notification_email_body_template( $body );

	return [
		'subject' => $subject,
		'body'    => $body,
	];
}

/**
 * Get the default notification email template payload.
 *
 * @return array<string, mixed> Default template values.
 */
function alpaistr_get_notification_email_template_defaults() {
	return [
		'subject' => alpaistr_get_notification_email_subject_template_default(),
		'body'    => alpaistr_get_notification_email_body_template_default(),
	];
}

/**
 * Sanitize an email subject template.
 *
 * @param string $subject Subject template.
 * @return string Sanitized subject template.
 */
function alpaistr_sanitize_notification_email_subject_template( $subject ) {
	return alpaistr_sanitize_notification_template_subject(
		$subject,
		alpaistr_get_notification_email_subject_template_default()
	);
}

/**
 * Return the lock attributes used for the required comment content block.
 *
 * @return array<string, bool> Comment block lock attributes.
 */
function alpaistr_get_notification_template_comment_block_lock() {
	return [
		'move'   => false,
		'remove' => true,
	];
}

/**
 * Normalize a parsed notification email template block.
 *
 * @param array<string, mixed> $block Parsed block data.
 * @return array<string, mixed> Normalized parsed block data.
 */
function alpaistr_normalize_notification_template_block( $block ) {
	$block_name = isset( $block['blockName'] ) ? (string) $block['blockName'] : '';

	if ( 'alpaca/email-comment-content' === $block_name ) {
		$attrs = [];

		if ( isset( $block['attrs'] ) && is_array( $block['attrs'] ) ) {
			$attrs = $block['attrs'];
		}

		$attrs['lock']  = alpaistr_get_notification_template_comment_block_lock();
		$block['attrs'] = $attrs;
	}

	return $block;
}

/**
 * Normalize a serialized notification email body template.
 *
 * @param string $body Serialized block content.
 * @return string Normalized serialized block content.
 */
function alpaistr_normalize_notification_email_body_template( $body ) {
	return alpaistr_normalize_notification_template_body_with_callbacks(
		$body,
		alpaistr_get_notification_email_body_template_default(),
		alpaistr_get_notification_template_allowed_block_types(),
		'alpaistr_normalize_notification_template_block'
	);
}

/**
 * Sanitize an email body template and validate required placeholders.
 *
 * @param string $body Serialized block content.
 * @return string|WP_Error Sanitized body string or WP_Error on failure.
 */
function alpaistr_sanitize_notification_email_body_template( $body ) {
	return alpaistr_sanitize_notification_template_body_with_callbacks(
		$body,
		alpaistr_get_notification_email_body_template_default(),
		alpaistr_get_notification_template_allowed_block_types(),
		'alpaistr_normalize_notification_template_block',
		null,
		[ 'alpaca/email-comment-content' ],
		'alpaca_notification_template_empty',
		esc_html__( 'The email template must contain at least one supported block.', 'alpaca-issue-tracker' ),
		'alpaca_notification_template_missing_comment',
		esc_html__( 'The email template must include the Full Comment Content placeholder block.', 'alpaca-issue-tracker' )
	);
}

/**
 * Save the email template settings.
 *
 * @param string $subject Subject template.
 * @param string $body    Serialized block content.
 * @return array<string, mixed>|WP_Error Saved template or WP_Error.
 */
function alpaistr_update_notification_email_template( $subject, $body ) {
	$subject = alpaistr_sanitize_notification_email_subject_template( $subject );
	$body    = alpaistr_sanitize_notification_email_body_template( $body );

	if ( is_wp_error( $body ) ) {
		return $body;
	}

	update_option( 'alpaistr_notification_email_subject_template', $subject );
	update_option( 'alpaistr_notification_email_body_template', $body );
	delete_option( 'alpaistr_notification_email_template_context' );

	return alpaistr_get_notification_email_template();
}

/**
 * Reset the saved notification email template to its defaults.
 *
 * @return array<string, mixed>|WP_Error Reset template or WP_Error.
 */
function alpaistr_reset_notification_email_template() {
	$defaults = alpaistr_get_notification_email_template_defaults();

	return alpaistr_update_notification_email_template(
		$defaults['subject'],
		$defaults['body']
	);
}
