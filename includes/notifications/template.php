<?php
/**
 * Notification template helpers for Alpaca issue activity emails.
 *
 * @package Alpaca
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
function alpaca_get_notification_email_subject_template_default() {
	return '[{{site_title}}] [{{issue_title}}] {{event_label}}';
}

/**
 * Return the legacy default email subject template.
 *
 * @return string Legacy subject template.
 */
function alpaca_get_notification_email_subject_template_legacy_default() {
	return '[Alpaca] {{issue_title}} updated';
}

/**
 * Return the default email body template.
 *
 * @return string Serialized block content.
 */
function alpaca_get_notification_email_body_template_default() {
	return implode(
		"\n",
		array(
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
		)
	);
}

/**
 * Return the legacy default email body template.
 *
 * @return string Legacy serialized block content.
 */
function alpaca_get_notification_email_body_template_legacy_default() {
	return implode(
		"\n",
		array(
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
		)
	);
}

/**
 * Sanitize structured notification context saved on comment meta.
 *
 * @param mixed $value Raw meta value.
 * @return array<string, mixed> Sanitized context array.
 */
function alpaca_sanitize_notification_context_meta( $value ) {
	if ( ! is_array( $value ) ) {
		return array();
	}

	$sanitized = array();

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
 * Return the Alpaca placeholder block names for the email template editor.
 *
 * @return string[] Allowed placeholder block names.
 */
function alpaca_get_notification_template_allowed_blocks() {
	return array(
		'alpaca/email-issue-title',
		'alpaca/email-actor-name',
		'alpaca/email-event-label',
		'alpaca/email-comment-content',
		'alpaca/email-issue-link',
		'alpaca/email-site-name',
		'alpaca/email-site-tagline',
		'alpaca/email-site-logo',
		'alpaca/email-event-time',
	);
}

/**
 * Get the default notification template context.
 *
 * @return array<string, int> Default template context.
 */
function alpaca_get_notification_email_template_context_default() {
	return array(
		'site_logo_id' => 0,
	);
}

/**
 * Sanitize notification template context values.
 *
 * @param mixed $context Raw context value.
 * @return array<string, int> Sanitized template context.
 */
function alpaca_sanitize_notification_email_template_context( $context ) {
	$defaults = alpaca_get_notification_email_template_context_default();
	if ( ! is_array( $context ) ) {
		return $defaults;
	}

	return array(
		'site_logo_id' => isset( $context['site_logo_id'] ) ? absint( $context['site_logo_id'] ) : 0,
	);
}

/**
 * Get the current site logo URL for notification emails.
 *
 * @param array<string, int> $template_context Template context values.
 * @return string Site logo URL.
 */
function alpaca_get_notification_site_logo_url( $template_context = array() ) {
	$template_context = alpaca_sanitize_notification_email_template_context( $template_context );
	$logo_id          = (int) $template_context['site_logo_id'];

	if ( $logo_id <= 0 ) {
		$logo_id = (int) get_theme_mod( 'custom_logo' );
	}

	if ( $logo_id <= 0 ) {
		return '';
	}

	$logo_url = wp_get_attachment_image_url( $logo_id, 'full' );

	return is_string( $logo_url ) ? $logo_url : '';
}

/**
 * Get the current site icon URL for notification emails.
 *
 * @return string Site icon URL.
 */
function alpaca_get_notification_site_icon_url() {
	$icon_url = get_site_icon_url( 512 );

	return is_string( $icon_url ) ? $icon_url : '';
}

/**
 * Determine whether a block is allowed in the notification template.
 *
 * @param string $block_name Block name.
 * @return bool True when the block is allowed.
 */
function alpaca_notification_template_block_is_allowed( $block_name ) {
	$block_name = is_string( $block_name ) ? $block_name : '';
	if ( '' === $block_name ) {
		return false;
	}

	if ( 0 === strpos( $block_name, 'core/' ) ) {
		return true;
	}

	return in_array( $block_name, alpaca_get_notification_template_allowed_blocks(), true );
}

/**
 * Get the saved notification email template.
 *
 * @return array<string, mixed> Saved template values.
 */
function alpaca_get_notification_email_template() {
	$subject = get_option( 'alpaca_notification_email_subject_template', '' );
	$body    = get_option( 'alpaca_notification_email_body_template', '' );
	$context = get_option( 'alpaca_notification_email_template_context', array() );

	if ( ! is_string( $subject ) || '' === $subject ) {
		$subject = alpaca_get_notification_email_subject_template_default();
	} elseif ( alpaca_get_notification_email_subject_template_legacy_default() === $subject ) {
		$subject = alpaca_get_notification_email_subject_template_default();
	}

	if ( ! is_string( $body ) || '' === $body ) {
		$body = alpaca_get_notification_email_body_template_default();
	} elseif ( alpaca_get_notification_email_body_template_legacy_default() === $body ) {
		$body = alpaca_get_notification_email_body_template_default();
	}

	$body = alpaca_normalize_notification_email_body_template( $body );

	$context = alpaca_sanitize_notification_email_template_context( $context );

	return array(
		'subject' => $subject,
		'body'    => $body,
		'context' => $context,
	);
}

/**
 * Get the default notification email template payload.
 *
 * @return array<string, mixed> Default template values.
 */
function alpaca_get_notification_email_template_defaults() {
	return array(
		'subject' => alpaca_get_notification_email_subject_template_default(),
		'body'    => alpaca_get_notification_email_body_template_default(),
		'context' => alpaca_get_notification_email_template_context_default(),
	);
}

/**
 * Sanitize an email subject template.
 *
 * @param string $subject Subject template.
 * @return string Sanitized subject template.
 */
function alpaca_sanitize_notification_email_subject_template( $subject ) {
	$subject = is_string( $subject ) ? trim( wp_strip_all_tags( $subject ) ) : '';

	if ( '' === $subject ) {
		return alpaca_get_notification_email_subject_template_default();
	}

	return $subject;
}

/**
 * Determine whether a parsed block tree includes the required comment content block.
 *
 * @param array<int, array<string, mixed>> $blocks Parsed blocks.
 * @return bool True when the required block is present.
 */
function alpaca_notification_template_has_comment_block( $blocks ) {
	foreach ( $blocks as $block ) {
		$block_name = isset( $block['blockName'] ) ? (string) $block['blockName'] : '';
		if ( 'alpaca/email-comment-content' === $block_name ) {
			return true;
		}

		$inner_blocks = isset( $block['innerBlocks'] ) && is_array( $block['innerBlocks'] ) ? $block['innerBlocks'] : array();
		if ( ! empty( $inner_blocks ) && alpaca_notification_template_has_comment_block( $inner_blocks ) ) {
			return true;
		}
	}

	return false;
}

/**
 * Return the lock attributes used for the required comment content block.
 *
 * @return array<string, bool> Comment block lock attributes.
 */
function alpaca_get_notification_template_comment_block_lock() {
	return array(
		'move'   => false,
		'remove' => true,
	);
}

/**
 * Normalize a parsed notification email template block.
 *
 * @param array<string, mixed> $block Parsed block data.
 * @return array<string, mixed> Normalized parsed block data.
 */
function alpaca_normalize_notification_template_block( $block ) {
	$block_name = isset( $block['blockName'] ) ? (string) $block['blockName'] : '';

	if ( 'alpaca/email-comment-content' === $block_name ) {
		$attrs = array();

		if ( isset( $block['attrs'] ) && is_array( $block['attrs'] ) ) {
			$attrs = $block['attrs'];
		}

		$attrs['lock']  = alpaca_get_notification_template_comment_block_lock();
		$block['attrs'] = $attrs;
	}

	return $block;
}

/**
 * Filter parsed blocks to the allowed email template block set.
 *
 * @param array<int, array<string, mixed>> $blocks Parsed blocks.
 * @return array<int, array<string, mixed>> Filtered blocks.
 */
function alpaca_filter_notification_template_blocks( $blocks ) {
	$filtered = array();

	foreach ( $blocks as $block ) {
		$block_name = isset( $block['blockName'] ) ? (string) $block['blockName'] : '';
		if ( '' === $block_name ) {
			continue;
		}

		if ( ! alpaca_notification_template_block_is_allowed( $block_name ) ) {
			continue;
		}

		$block['innerBlocks'] = isset( $block['innerBlocks'] ) && is_array( $block['innerBlocks'] )
			? alpaca_filter_notification_template_blocks( $block['innerBlocks'] )
			: array();
		$filtered[]           = alpaca_normalize_notification_template_block( $block );
	}

	return $filtered;
}

/**
 * Normalize a serialized notification email body template.
 *
 * @param string $body Serialized block content.
 * @return string Normalized serialized block content.
 */
function alpaca_normalize_notification_email_body_template( $body ) {
	$body = is_string( $body ) ? trim( $body ) : '';

	if ( '' === $body ) {
		$body = alpaca_get_notification_email_body_template_default();
	}

	$blocks   = parse_blocks( $body );
	$filtered = alpaca_filter_notification_template_blocks( $blocks );

	if ( empty( $filtered ) ) {
		return alpaca_get_notification_email_body_template_default();
	}

	return serialize_blocks( $filtered );
}

/**
 * Sanitize an email body template and validate required placeholders.
 *
 * @param string $body Serialized block content.
 * @return string|WP_Error Sanitized body string or WP_Error on failure.
 */
function alpaca_sanitize_notification_email_body_template( $body ) {
	$body = is_string( $body ) ? trim( $body ) : '';
	if ( '' === $body ) {
		$body = alpaca_get_notification_email_body_template_default();
	}

	$blocks   = parse_blocks( $body );
	$filtered = alpaca_filter_notification_template_blocks( $blocks );

	if ( empty( $filtered ) ) {
		return new WP_Error(
			'alpaca_notification_template_empty',
			esc_html__( 'The email template must contain at least one supported block.', 'alpaca' ),
			array( 'status' => 400 )
		);
	}

	if ( ! alpaca_notification_template_has_comment_block( $filtered ) ) {
		return new WP_Error(
			'alpaca_notification_template_missing_comment',
			esc_html__( 'The email template must include the Full Comment Content placeholder block.', 'alpaca' ),
			array( 'status' => 400 )
		);
	}

	return serialize_blocks( $filtered );
}

/**
 * Save the email template settings.
 *
 * @param string               $subject Subject template.
 * @param string               $body    Serialized block content.
 * @param array<string, mixed> $context Template context values.
 * @return array<string, mixed>|WP_Error Saved template or WP_Error.
 */
function alpaca_update_notification_email_template( $subject, $body, $context = array() ) {
	$subject = alpaca_sanitize_notification_email_subject_template( $subject );
	$body    = alpaca_sanitize_notification_email_body_template( $body );
	$context = alpaca_sanitize_notification_email_template_context( $context );

	if ( is_wp_error( $body ) ) {
		return $body;
	}

	update_option( 'alpaca_notification_email_subject_template', $subject );
	update_option( 'alpaca_notification_email_body_template', $body );
	update_option( 'alpaca_notification_email_template_context', $context );

	return alpaca_get_notification_email_template();
}

/**
 * Reset the saved notification email template to its defaults.
 *
 * @return array<string, mixed>|WP_Error Reset template or WP_Error.
 */
function alpaca_reset_notification_email_template() {
	$defaults = alpaca_get_notification_email_template_defaults();

	return alpaca_update_notification_email_template(
		$defaults['subject'],
		$defaults['body'],
		$defaults['context']
	);
}
