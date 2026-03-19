<?php
/**
 * Daily digest template helpers.
 *
 * @package Alpaca
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Return the default daily digest subject template.
 *
 * @return string Subject template.
 */
function alpaca_get_notification_daily_digest_subject_template_default() {
	return '[{{site_title}}] Daily Summary for {{digest_day}}';
}

/**
 * Return the lock attributes used for required daily digest section blocks.
 *
 * @return array<string, bool> Block lock attributes.
 */
function alpaca_get_notification_daily_digest_required_block_lock() {
	return array(
		'move'   => false,
		'remove' => true,
	);
}

/**
 * Return the required block names for the daily digest template.
 *
 * @return string[] Required block names.
 */
function alpaca_get_notification_daily_digest_required_block_names() {
	return array(
		'alpaca/digest-deadline-watch',
		'alpaca/digest-issue-activity',
		'alpaca/digest-new-items',
	);
}

/**
 * Return the custom placeholder block names for the daily digest template editor.
 *
 * @return string[] Allowed custom block names.
 */
function alpaca_get_notification_daily_digest_template_allowed_blocks() {
	return array(
		'alpaca/digest-site-icon',
		'alpaca/digest-deadline-watch',
		'alpaca/digest-issue-activity',
		'alpaca/digest-new-items',
	);
}

/**
 * Return the full block allow-list for the daily digest template editor.
 *
 * @return string[] Allowed block names.
 */
function alpaca_get_notification_daily_digest_template_allowed_block_types() {
	return alpaca_get_notification_template_allowed_block_types_for_blocks(
		alpaca_get_notification_daily_digest_template_allowed_blocks()
	);
}

/**
 * Build the default serialized daily digest body template.
 *
 * @param string|null $preamble   Optional preamble text.
 * @param string|null $postscript Optional postscript text.
 * @return string Serialized block content.
 */
function alpaca_get_notification_daily_digest_body_template_default( $preamble = null, $postscript = null ) {
	$preamble = is_string( $preamble ) ? trim( $preamble ) : '';

	if ( ! is_string( $postscript ) || '' === trim( $postscript ) ) {
		$postscript = __( 'You are receiving this summary because you opted into the daily digest.', 'alpaca' );
	}

	$lock = wp_json_encode( alpaca_get_notification_daily_digest_required_block_lock() );

	return implode(
		"\n",
		array(
			'<!-- wp:group {"className":"alpaca-notification-header","layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"}} -->',
			'<div class="wp-block-group alpaca-notification-header">',
			'<!-- wp:alpaca/digest-site-icon /-->',
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
			'<h2>' . esc_html__( 'Daily Summary for {{digest_day}}', 'alpaca' ) . '</h2>',
			'<!-- /wp:heading -->',
			( '' !== $preamble )
				? '<!-- wp:paragraph --><p>' . esc_html( $preamble ) . '</p><!-- /wp:paragraph -->'
				: '',
			'<!-- wp:alpaca/digest-deadline-watch {"lock":' . $lock . '} /-->',
			'<!-- wp:alpaca/digest-issue-activity {"lock":' . $lock . '} /-->',
			'<!-- wp:alpaca/digest-new-items {"lock":' . $lock . '} /-->',
			'<!-- wp:paragraph -->',
			'<p>' . esc_html( $postscript ) . '</p>',
			'<!-- /wp:paragraph -->',
		)
	);
}

/**
 * Return the legacy preamble value for daily digest migration.
 *
 * @return string Legacy preamble text.
 */
function alpaca_get_notification_daily_digest_legacy_preamble() {
	$preamble = get_option( 'alpaca_daily_digest_preamble_template', '' );

	return is_string( $preamble ) ? trim( wp_strip_all_tags( $preamble ) ) : '';
}

/**
 * Return the legacy postscript value for daily digest migration.
 *
 * @return string Legacy postscript text.
 */
function alpaca_get_notification_daily_digest_legacy_postscript() {
	$postscript = get_option( 'alpaca_daily_digest_postscript_template', '' );

	return is_string( $postscript ) ? trim( wp_strip_all_tags( $postscript ) ) : '';
}

/**
 * Determine whether a parsed digest body includes all required section blocks.
 *
 * @param array<int, array<string, mixed>> $blocks Parsed blocks.
 * @return bool True when all required blocks are present.
 */
function alpaca_notification_daily_digest_template_has_required_blocks( $blocks ) {
	return alpaca_notification_template_has_required_blocks(
		$blocks,
		alpaca_get_notification_daily_digest_required_block_names()
	);
}

/**
 * Determine whether a parsed daily digest template uses the legacy
 * placeholder-only layout that omitted the editable header structure.
 *
 * @param array<int, array<string, mixed>> $blocks Parsed blocks.
 * @return bool True when the layout should be upgraded to the current default.
 */
function alpaca_notification_daily_digest_template_uses_legacy_placeholder_only_layout( $blocks ) {
	$allowed_legacy_blocks = array(
		'alpaca/digest-deadline-watch',
		'alpaca/digest-issue-activity',
		'alpaca/digest-new-items',
	);

	foreach ( $blocks as $block ) {
		$block_name = isset( $block['blockName'] ) ? (string) $block['blockName'] : '';
		if ( '' === $block_name ) {
			continue;
		}

		if ( ! in_array( $block_name, $allowed_legacy_blocks, true ) ) {
			return false;
		}

		$inner_blocks = isset( $block['innerBlocks'] ) && is_array( $block['innerBlocks'] ) ? $block['innerBlocks'] : array();
		if ( ! empty( $inner_blocks ) ) {
			return false;
		}
	}

	return alpaca_notification_daily_digest_template_has_required_blocks( $blocks );
}

/**
 * Normalize a parsed daily digest template block.
 *
 * @param array<string, mixed> $block Parsed block data.
 * @return array<string, mixed>|null Normalized block data.
 */
function alpaca_normalize_notification_daily_digest_template_block( $block ) {
	$block_name = isset( $block['blockName'] ) ? (string) $block['blockName'] : '';

	if ( in_array( $block_name, alpaca_get_notification_daily_digest_required_block_names(), true ) ) {
		$attrs = array();

		if ( isset( $block['attrs'] ) && is_array( $block['attrs'] ) ) {
			$attrs = $block['attrs'];
		}

		$attrs['lock']  = alpaca_get_notification_daily_digest_required_block_lock();
		$block['attrs'] = $attrs;
	}

	return $block;
}

/**
 * Normalize a serialized daily digest body template.
 *
 * @param string $body Serialized block content.
 * @return string Normalized serialized block content.
 */
function alpaca_normalize_notification_daily_digest_body_template( $body ) {
	return alpaca_normalize_notification_template_body_with_callbacks(
		$body,
		alpaca_get_notification_daily_digest_body_template_default(),
		alpaca_get_notification_daily_digest_template_allowed_block_types(),
		'alpaca_normalize_notification_daily_digest_template_block',
		null,
		'alpaca_notification_daily_digest_template_uses_legacy_placeholder_only_layout'
	);
}

/**
 * Sanitize a daily digest subject template.
 *
 * @param string $subject Subject template.
 * @return string Sanitized subject template.
 */
function alpaca_sanitize_notification_daily_digest_subject_template( $subject ) {
	return alpaca_sanitize_notification_template_subject(
		$subject,
		alpaca_get_notification_daily_digest_subject_template_default()
	);
}

/**
 * Sanitize a daily digest body template and validate required placeholders.
 *
 * @param string $body Serialized block content.
 * @return string|WP_Error Sanitized body string or WP_Error on failure.
 */
function alpaca_sanitize_notification_daily_digest_body_template( $body ) {
	return alpaca_sanitize_notification_template_body_with_callbacks(
		$body,
		alpaca_get_notification_daily_digest_body_template_default(),
		alpaca_get_notification_daily_digest_template_allowed_block_types(),
		'alpaca_normalize_notification_daily_digest_template_block',
		null,
		alpaca_get_notification_daily_digest_required_block_names(),
		'alpaca_daily_digest_template_empty',
		esc_html__( 'The daily digest template must contain at least one supported block.', 'alpaca' ),
		'alpaca_daily_digest_template_missing_sections',
		esc_html__( 'The daily digest template must include the locked digest section blocks.', 'alpaca' )
	);
}

/**
 * Return the default daily digest template payload.
 *
 * @return array<string, string> Default template values.
 */
function alpaca_get_notification_daily_digest_template_defaults() {
	return array(
		'subject' => alpaca_get_notification_daily_digest_subject_template_default(),
		'body'    => alpaca_get_notification_daily_digest_body_template_default(),
	);
}

/**
 * Get the saved daily digest template.
 *
 * @return array<string, string> Saved template values.
 */
function alpaca_get_notification_daily_digest_template() {
	$defaults = alpaca_get_notification_daily_digest_template_defaults();
	$subject  = get_option( 'alpaca_daily_digest_subject_template', $defaults['subject'] );
	$body     = get_option( 'alpaca_daily_digest_body_template', '' );

	if ( ! is_string( $body ) || '' === trim( $body ) ) {
		$body = alpaca_get_notification_daily_digest_body_template_default(
			alpaca_get_notification_daily_digest_legacy_preamble(),
			alpaca_get_notification_daily_digest_legacy_postscript()
		);
	}

	$body = alpaca_normalize_notification_daily_digest_body_template( $body );

	return array(
		'subject' => is_string( $subject ) && '' !== trim( $subject ) ? trim( $subject ) : $defaults['subject'],
		'body'    => $body,
	);
}

/**
 * Save the daily digest template.
 *
 * @param string $subject Subject template.
 * @param string $body    Serialized block content.
 * @return array<string, string>|WP_Error Saved template values or WP_Error.
 */
function alpaca_update_notification_daily_digest_template( $subject, $body ) {
	$subject = alpaca_sanitize_notification_daily_digest_subject_template( $subject );
	$body    = alpaca_sanitize_notification_daily_digest_body_template( $body );

	if ( is_wp_error( $body ) ) {
		return $body;
	}

	update_option( 'alpaca_daily_digest_subject_template', $subject );
	update_option( 'alpaca_daily_digest_body_template', $body );

	return alpaca_get_notification_daily_digest_template();
}

/**
 * Reset the daily digest template to defaults.
 *
 * @return array<string, string> Reset template values.
 */
function alpaca_reset_notification_daily_digest_template() {
	$defaults = alpaca_get_notification_daily_digest_template_defaults();

	return alpaca_update_notification_daily_digest_template( $defaults['subject'], $defaults['body'] );
}
