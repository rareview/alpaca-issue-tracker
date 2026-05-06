<?php
/**
 * Notification rendering helpers for Alpaca issue activity emails.
 *
 * @package Alpaca
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Build placeholder token replacements for an event.
 *
 * @param array<string, mixed> $event Notification event.
 * @return array<string, string> Token map.
 */
function alpaca_get_notification_template_tokens( $event ) {
	$timestamp = isset( $event['timestamp'] ) ? (string) $event['timestamp'] : '';
	$time_text = '';

	if ( '' !== $timestamp ) {
		$time_text = wp_date( get_option( 'date_format' ) . ' ' . get_option( 'time_format' ), strtotime( $timestamp ) );
	}

	return [
		'{{issue_title}}'       => isset( $event['issue']['title'] ) ? (string) $event['issue']['title'] : '',
		'{{actor_name}}'        => isset( $event['actor']['display_name'] ) ? (string) $event['actor']['display_name'] : '',
		'{{performed_by}}'      => isset( $event['actor']['display_name'] ) ? (string) $event['actor']['display_name'] : '',
		'{{event_label}}'       => isset( $event['event_label'] ) ? (string) $event['event_label'] : '',
		'{{site_name}}'         => isset( $event['site']['title'] ) ? (string) $event['site']['title'] : '',
		'{{site_title}}'        => isset( $event['site']['title'] ) ? (string) $event['site']['title'] : '',
		'{{site_tagline}}'      => isset( $event['site']['tagline'] ) ? (string) $event['site']['tagline'] : '',
		'{{site_logo_url}}'     => alpaca_get_notification_site_icon_url(),
		'{{site_icon_url}}'     => alpaca_get_notification_site_icon_url(),
		'{{notifications_url}}' => alpaca_get_notification_preferences_url(),
		'{{event_time}}'        => $time_text,
		'{{issue_url}}'         => isset( $event['issue']['url'] ) ? (string) $event['issue']['url'] : '',
	];
}

/**
 * Render mentions in comment content for HTML output.
 *
 * @param string                           $content  Raw comment content.
 * @param array<int, array<string, mixed>> $mentions Mention metadata.
 * @return string Content with mention markup.
 */
function alpaca_render_notification_mentions( $content, $mentions ) {
	$content  = is_string( $content ) ? $content : '';
	$mentions = is_array( $mentions ) ? $mentions : [];
	if ( '' === $content || empty( $mentions ) ) {
		return $content;
	}

	foreach ( $mentions as $mention ) {
		if ( empty( $mention['slug'] ) || empty( $mention['display_name'] ) ) {
			continue;
		}

		$slug         = sanitize_user( (string) $mention['slug'], true );
		$display_name = esc_html( (string) $mention['display_name'] );
		$replacement  = '<span class="alpaca-notification-mention">@' . $display_name . '</span>';
		$content      = preg_replace( '/(^|[\s>\(\[\{])@' . preg_quote( $slug, '/' ) . '(?=$|[^a-zA-Z0-9._-])/', '$1' . $replacement, $content );
	}

	return $content;
}

/**
 * Render stored comment content to email-safe HTML.
 *
 * @param array<string, mixed> $event Notification event.
 * @return string HTML content.
 */
function alpaca_render_notification_comment_html( $event ) {
	$raw       = isset( $event['comment']['raw'] ) ? (string) $event['comment']['raw'] : '';
	$mentions  = isset( $event['comment']['mentions'] ) && is_array( $event['comment']['mentions'] ) ? $event['comment']['mentions'] : [];
	$raw       = alpaca_render_notification_mentions( $raw, $mentions );
	$sanitized = wp_kses(
		$raw,
		[
			'a'      => [
				'href'   => true,
				'target' => true,
				'rel'    => true,
			],
			'strong' => [],
			'em'     => [],
			'br'     => [],
			'span'   => [
				'class'       => true,
				'data-userid' => true,
				'data-avatar' => true,
			],
		]
	);
	$sanitized = preg_replace( '/\*\*(.*?)\*\*/', '<strong>$1</strong>', $sanitized );
	$sanitized = preg_replace( '/\*(.*?)\*/', '<em>$1</em>', $sanitized );
	$sanitized = preg_replace_callback(
		'/\[(.*?)\]\((.*?)\)/',
		function ( $matches ) {
			$label = isset( $matches[1] ) ? esc_html( $matches[1] ) : '';
			$url   = isset( $matches[2] ) ? esc_url( $matches[2] ) : '';

			if ( '' === $url ) {
				return $label;
			}

			return '<a href="' . $url . '">' . $label . '</a>';
		},
		$sanitized
	);
	$sanitized = make_clickable( $sanitized );
	$sanitized = wpautop( $sanitized );

	return $sanitized;
}

/**
 * Render comment attachments to HTML.
 *
 * @param string[] $attachments Attachment URLs.
 * @return string HTML markup.
 */
function alpaca_render_notification_attachments_html( $attachments ) {
	$attachments = is_array( $attachments ) ? $attachments : [];
	if ( empty( $attachments ) ) {
		return '';
	}

	$items = [];
	foreach ( $attachments as $attachment ) {
		$url = esc_url( (string) $attachment );
		if ( '' === $url ) {
			continue;
		}

		$items[] = '<li><a href="' . $url . '">' . esc_html__( 'View attachment', 'alpaca' ) . '</a></li>';
	}

	if ( empty( $items ) ) {
		return '';
	}

	return '<div class="alpaca-notification-attachments"><h3>' . esc_html__( 'Attachments', 'alpaca' ) . '</h3><ul>' . implode( '', $items ) . '</ul></div>';
}

/**
 * Render a custom Alpaca email placeholder block.
 *
 * @param string               $block_name Block name.
 * @param array<string, mixed> $event      Notification event.
 * @return string HTML output.
 */
function alpaca_render_notification_placeholder_block( $block_name, $event ) {
	$tokens = alpaca_get_notification_template_tokens( $event );

	if ( 'alpaca/email-issue-title' === $block_name ) {
		return '<p>' . esc_html( $tokens['{{issue_title}}'] ) . '</p>';
	}

	if ( 'alpaca/email-actor-name' === $block_name ) {
		return '<p>' . esc_html( $tokens['{{performed_by}}'] ) . '</p>';
	}

	if ( 'alpaca/email-event-label' === $block_name ) {
		return '<p>' . esc_html( $tokens['{{event_label}}'] ) . '</p>';
	}

	if ( 'alpaca/email-issue-link' === $block_name ) {
		return '<p><a href="' . esc_url( $tokens['{{issue_url}}'] ) . '">' . esc_html__( 'Open Issue', 'alpaca' ) . '</a></p>';
	}

	if ( 'alpaca/email-site-name' === $block_name ) {
		return '<p>' . esc_html( $tokens['{{site_title}}'] ) . '</p>';
	}

	if ( 'alpaca/email-site-tagline' === $block_name ) {
		if ( '' === $tokens['{{site_tagline}}'] ) {
			return '';
		}

		return '<p>' . esc_html( $tokens['{{site_tagline}}'] ) . '</p>';
	}

	if ( 'alpaca/email-site-logo' === $block_name ) {
		if ( '' === $tokens['{{site_logo_url}}'] ) {
			return '';
		}

		return '<p><img class="alpaca-notification-site-icon" src="' . esc_url( $tokens['{{site_logo_url}}'] ) . '" alt="' . esc_attr( $tokens['{{site_title}}'] ) . '" /></p>';
	}

	if ( 'alpaca/email-event-time' === $block_name ) {
		return '<p>' . esc_html( $tokens['{{event_time}}'] ) . '</p>';
	}

	if ( 'alpaca/email-comment-content' === $block_name ) {
		$comment_html  = alpaca_render_notification_comment_html( $event );
		$attachments   = isset( $event['comment']['attachments'] ) && is_array( $event['comment']['attachments'] ) ? $event['comment']['attachments'] : [];
		$attachments_h = alpaca_render_notification_attachments_html( $attachments );
		return '<div class="alpaca-notification-comment-content">' . $comment_html . $attachments_h . '</div>';
	}

	return '';
}

/**
 * Render a site logo block for email output.
 *
 * @param array<string, mixed> $block Parsed block.
 * @param array<string, mixed> $event Notification event.
 * @return string HTML output.
 */
function alpaca_render_notification_site_logo_block( $block, $event ) {
	$tokens   = alpaca_get_notification_template_tokens( $event );
	$logo_url = alpaca_get_notification_site_icon_url();

	if ( '' === $logo_url ) {
		return '';
	}

	$site_title  = isset( $tokens['{{site_title}}'] ) ? $tokens['{{site_title}}'] : '';
	$site_url    = isset( $event['site']['url'] ) ? (string) $event['site']['url'] : '';
	$attributes  = isset( $block['attrs'] ) && is_array( $block['attrs'] ) ? $block['attrs'] : [];
	$width_attr  = isset( $attributes['width'] ) ? absint( $attributes['width'] ) : 0;
	$width_html  = $width_attr > 0 ? ' width="' . $width_attr . '"' : '';
	$logo_markup = '<img class="alpaca-notification-site-logo" src="' . esc_url( $logo_url ) . '" alt="' . esc_attr( $site_title ) . '"' . $width_html . ' />';

	if ( ! empty( $attributes['isLink'] ) && '' !== $site_url ) {
		$link_attributes = ' href="' . esc_url( $site_url ) . '" class="custom-logo-link"';
		if ( ! empty( $attributes['linkTarget'] ) && '_blank' === $attributes['linkTarget'] ) {
			$link_attributes .= ' target="_blank" rel="noopener noreferrer home"';
		} else {
			$link_attributes .= ' rel="home"';
		}

		$logo_markup = '<a' . $link_attributes . '>' . $logo_markup . '</a>';
	}

	return '<div class="wp-block-site-logo">' . $logo_markup . '</div>';
}

/**
 * Create a raw HTML block for notification email rendering.
 *
 * @param string $html HTML content.
 * @return array<string, mixed> Parsed block structure.
 */
function alpaca_create_notification_html_block( $html ) {
	return [
		'blockName'    => 'core/html',
		'attrs'        => [],
		'innerBlocks'  => [],
		'innerHTML'    => $html,
		'innerContent' => [ $html ],
	];
}

/**
 * Prepare a parsed notification email block for server rendering.
 *
 * @param array<string, mixed> $block Parsed block.
 * @param array<string, mixed> $event Notification event.
 * @return array<string, mixed> Prepared parsed block.
 */
function alpaca_prepare_notification_block_for_render( $block, $event ) {
	$block_name = isset( $block['blockName'] ) ? (string) $block['blockName'] : '';

	if ( 0 === strpos( $block_name, 'alpaca/email-' ) ) {
		$html = alpaca_render_notification_placeholder_block( $block_name, $event );

		return alpaca_create_notification_html_block( $html );
	}

	if ( 'core/site-logo' === $block_name ) {
		$html = alpaca_render_notification_site_logo_block( $block, $event );

		return alpaca_create_notification_html_block( $html );
	}

	if ( isset( $block['innerBlocks'] ) && is_array( $block['innerBlocks'] ) && ! empty( $block['innerBlocks'] ) ) {
		$block['innerBlocks'] = alpaca_prepare_notification_blocks_for_render( $block['innerBlocks'], $event );
	}

	return $block;
}

/**
 * Prepare parsed email blocks for server rendering.
 *
 * @param array<int, array<string, mixed>> $blocks Parsed blocks.
 * @param array<string, mixed>             $event  Notification event.
 * @return array<int, array<string, mixed>> Prepared parsed blocks.
 */
function alpaca_prepare_notification_blocks_for_render( $blocks, $event ) {
	$prepared = [];

	foreach ( $blocks as $block ) {
		$prepared[] = alpaca_prepare_notification_block_for_render( $block, $event );
	}

	return $prepared;
}

/**
 * Render parsed email blocks to HTML.
 *
 * @param array<int, array<string, mixed>> $blocks Parsed blocks.
 * @param array<string, mixed>             $event  Notification event.
 * @return string HTML output.
 */
function alpaca_render_notification_blocks( $blocks, $event ) {
	$output = '';
	$blocks = alpaca_prepare_notification_blocks_for_render( $blocks, $event );

	foreach ( $blocks as $block ) {
		$output .= render_block( $block );
	}

	return $output;
}

/**
 * Extract notification email CSS from the compiled stylesheet.
 *
 * @return string CSS rules.
 */
function alpaca_get_notification_email_css() {

	$css_path = ALPACA_PLUGIN_DIR . 'dist/index.css';
	if ( ! file_exists( $css_path ) ) {
		return '';
	}

	$css = file_get_contents( $css_path );
	if ( ! is_string( $css ) || '' === $css ) {
		return '';
	}

	$rules = [];

	preg_match_all( '/[^{}]*\.alpaca-notification-email[^{}]*\{[^}]*\}/', $css, $matches );
	if ( ! empty( $matches[0] ) ) {
		$rules = array_merge( $rules, $matches[0] );
	}

	/*
	* Some base email primitives are shared global selectors rather than
	* notification-email-prefixed selectors. Pull them in explicitly so the
	* sent email matches the editor preview.
	*/
	$shared_selectors = [
		'.alpaca-label-pill',
	];

	foreach ( $shared_selectors as $selector ) {
		$pattern = '/[^{}]*' . preg_quote( $selector, '/' ) . '[^{}]*\{[^}]*\}/';
		preg_match_all( $pattern, $css, $shared_matches );
		if ( ! empty( $shared_matches[0] ) ) {
			$rules = array_merge( $rules, $shared_matches[0] );
		}
	}

	if ( empty( $rules ) ) {
			return '';
	}

	return implode( "\n", array_values( array_unique( $rules ) ) );
}
/**
 * Wrap notification email HTML in the standard email document shell.
 *
 * @param string             $body_html      Rendered HTML body.
 * @param array<int, string> $extra_classes Extra CSS classes for the outer wrapper.
 * @return string Full HTML document.
 */
function alpaca_wrap_notification_email_html( $body_html, $extra_classes = [] ) {
	$classes = [ 'alpaca-notification-email' ];

	if ( is_array( $extra_classes ) ) {
		foreach ( $extra_classes as $class_name ) {
			if ( ! is_string( $class_name ) ) {
				continue;
			}

			$class_name = trim( $class_name );
			if ( '' === $class_name ) {
				continue;
			}

			$classes[] = $class_name;
		}
	}

	$css = alpaca_get_notification_email_css();

	return '<!DOCTYPE html><html><head><meta charset="utf-8" /><style>' . $css . '</style></head><body><div class="' . esc_attr( implode( ' ', array_unique( $classes ) ) ) . '"><div class="alpaca-notification-email__inner">' . $body_html . '</div></div></body></html>';
}

/**
 * Build a normalized notification message payload.
 *
 * @param string $subject Message subject.
 * @param string $html    Message HTML body.
 * @return array<string, string> Message payload.
 */
function alpaca_build_notification_message_payload( $subject, $html ) {
	$text         = wp_strip_all_tags( preg_replace( '/<\/?(p|div|br|li|h[1-6]|tr|section|article|ul|ol)>/i', "\n", $html ) );
	$from_details = alpaca_get_notification_mail_from_details();

	return [
		'subject'      => is_string( $subject ) ? $subject : '',
		'html'         => is_string( $html ) ? $html : '',
		'text'         => trim( $text ),
		'from_address' => $from_details['from_address'],
		'from_name'    => $from_details['from_name'],
		'from_label'   => $from_details['from_label'],
	];
}

/**
 * Send an HTML email notification.
 *
 * @param string               $address Email address.
 * @param array<string, mixed> $message Message payload.
 * @return bool True on success.
 */
function alpaca_send_notification_html_email( $address, $message ) {
	$address = is_string( $address ) ? sanitize_email( $address ) : '';
	if ( '' === $address || ! is_email( $address ) ) {
		return false;
	}

	$subject = isset( $message['subject'] ) ? (string) $message['subject'] : '';
	$html    = isset( $message['html'] ) ? (string) $message['html'] : '';

	return wp_mail(
		$address,
		$subject,
		$html,
		[ 'Content-Type: text/html; charset=UTF-8' ]
	);
}

/**
 * Get the effective mail sender details for notification previews and emails.
 *
 * @return array<string, string> Sender details.
 */
function alpaca_get_notification_mail_from_details() {
	$site_host = wp_parse_url( network_home_url(), PHP_URL_HOST );
	$site_host = is_string( $site_host ) ? strtolower( $site_host ) : '';

	if ( '' !== $site_host && 0 === strpos( $site_host, 'www.' ) ) {
		$site_host = substr( $site_host, 4 );
	}

	$default_address = '';
	if ( '' !== $site_host ) {
		$default_address = 'wordpress@' . $site_host;
	}

	if ( '' === $default_address ) {
		$default_address = (string) get_option( 'admin_email', '' );
	}

	$default_name = __( 'WordPress', 'alpaca' );
	// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound -- This uses the core WordPress mail from filter.
	$from_address = apply_filters( 'wp_mail_from', $default_address );
	// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound -- This uses the core WordPress mail from name filter.
	$from_name = apply_filters( 'wp_mail_from_name', $default_name );

	$from_address = is_string( $from_address ) ? sanitize_email( $from_address ) : '';
	$from_name    = is_string( $from_name ) ? trim( wp_strip_all_tags( $from_name ) ) : '';

	if ( '' === $from_address ) {
		$from_address = $default_address;
	}

	if ( '' === $from_name ) {
		$from_label = $from_address;
	} else {
		$from_label = sprintf( '%1$s <%2$s>', $from_name, $from_address );
	}

	return [
		'from_address' => $from_address,
		'from_name'    => $from_name,
		'from_label'   => $from_label,
	];
}

/**
 * Render the notification subject from a template.
 *
 * @param string               $subject_template Subject template.
 * @param array<string, mixed> $event            Notification event.
 * @return string Rendered subject.
 */
function alpaca_render_notification_subject( $subject_template, $event ) {
	$tokens = alpaca_get_notification_template_tokens( $event );
	return strtr( $subject_template, $tokens );
}

/**
 * Render the notification email body.
 *
 * @param string               $body_template Serialized body template.
 * @param array<string, mixed> $event         Notification event.
 * @return string Rendered HTML body.
 */
function alpaca_render_notification_body( $body_template, $event ) {
	$tokens        = alpaca_get_notification_template_tokens( $event );
	$body_template = strtr( $body_template, $tokens );
	$blocks        = parse_blocks( $body_template );
	$body_html     = alpaca_render_notification_blocks( $blocks, $event );

	return alpaca_wrap_notification_email_html( $body_html );
}

/**
 * Render a message object for a notification event.
 *
 * @param array<string, mixed>      $event    Notification event.
 * @param array<string, mixed>|null $template Optional template values.
 * @return array<string, string> Message object.
 */
function alpaca_render_notification_message( $event, $template = null ) {
	if ( ! is_array( $template ) ) {
		$template = alpaca_get_notification_email_template();
	}

	$subject = alpaca_render_notification_subject( $template['subject'], $event );
	$html    = alpaca_render_notification_body( $template['body'], $event );

	return alpaca_build_notification_message_payload( $subject, $html );
}
