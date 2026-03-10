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
 * @param array<string, mixed> $event            Notification event.
 * @param array<string, int>   $template_context Template context values.
 * @return array<string, string> Token map.
 */
function alpaca_get_notification_template_tokens( $event, $template_context = array() ) {
	$timestamp        = isset( $event['timestamp'] ) ? (string) $event['timestamp'] : '';
	$time_text        = '';
	$template_context = alpaca_sanitize_notification_email_template_context( $template_context );

	if ( '' !== $timestamp ) {
		$time_text = wp_date( get_option( 'date_format' ) . ' ' . get_option( 'time_format' ), strtotime( $timestamp ) );
	}

	return array(
		'{{issue_title}}'   => isset( $event['issue']['title'] ) ? (string) $event['issue']['title'] : '',
		'{{actor_name}}'    => isset( $event['actor']['display_name'] ) ? (string) $event['actor']['display_name'] : '',
		'{{performed_by}}'  => isset( $event['actor']['display_name'] ) ? (string) $event['actor']['display_name'] : '',
		'{{event_label}}'   => isset( $event['event_label'] ) ? (string) $event['event_label'] : '',
		'{{site_name}}'     => isset( $event['site']['title'] ) ? (string) $event['site']['title'] : '',
		'{{site_title}}'    => isset( $event['site']['title'] ) ? (string) $event['site']['title'] : '',
		'{{site_tagline}}'  => isset( $event['site']['tagline'] ) ? (string) $event['site']['tagline'] : '',
		'{{site_logo_url}}' => alpaca_get_notification_site_logo_url( $template_context ),
		'{{event_time}}'    => $time_text,
		'{{issue_url}}'     => isset( $event['issue']['url'] ) ? (string) $event['issue']['url'] : '',
	);
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
	$mentions = is_array( $mentions ) ? $mentions : array();
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
	$mentions  = isset( $event['comment']['mentions'] ) && is_array( $event['comment']['mentions'] ) ? $event['comment']['mentions'] : array();
	$raw       = alpaca_render_notification_mentions( $raw, $mentions );
	$sanitized = wp_kses(
		$raw,
		array(
			'a'      => array(
				'href'   => true,
				'target' => true,
				'rel'    => true,
			),
			'strong' => array(),
			'em'     => array(),
			'br'     => array(),
			'span'   => array(
				'class'       => true,
				'data-userid' => true,
				'data-avatar' => true,
			),
		)
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
	$attachments = is_array( $attachments ) ? $attachments : array();
	if ( empty( $attachments ) ) {
		return '';
	}

	$items = array();
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
 * @param string               $block_name        Block name.
 * @param array<string, mixed> $event             Notification event.
 * @param array<string, int>   $template_context  Template context values.
 * @return string HTML output.
 */
function alpaca_render_notification_placeholder_block( $block_name, $event, $template_context = array() ) {
	$tokens = alpaca_get_notification_template_tokens( $event, $template_context );

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

		return '<p><img class="alpaca-notification-site-logo" src="' . esc_url( $tokens['{{site_logo_url}}'] ) . '" alt="' . esc_attr( $tokens['{{site_title}}'] ) . '" /></p>';
	}

	if ( 'alpaca/email-event-time' === $block_name ) {
		return '<p>' . esc_html( $tokens['{{event_time}}'] ) . '</p>';
	}

	if ( 'alpaca/email-comment-content' === $block_name ) {
		$comment_html  = alpaca_render_notification_comment_html( $event );
		$attachments   = isset( $event['comment']['attachments'] ) && is_array( $event['comment']['attachments'] ) ? $event['comment']['attachments'] : array();
		$attachments_h = alpaca_render_notification_attachments_html( $attachments );
		return '<div class="alpaca-notification-comment-content">' . $comment_html . $attachments_h . '</div>';
	}

	return '';
}

/**
 * Render a site logo block for email output.
 *
 * @param array<string, mixed> $block            Parsed block.
 * @param array<string, mixed> $event            Notification event.
 * @param array<string, int>   $template_context Template context values.
 * @return string HTML output.
 */
function alpaca_render_notification_site_logo_block( $block, $event, $template_context = array() ) {
	$tokens   = alpaca_get_notification_template_tokens( $event, $template_context );
	$logo_url = isset( $tokens['{{site_logo_url}}'] ) ? $tokens['{{site_logo_url}}'] : '';

	if ( '' === $logo_url ) {
		return '';
	}

	$site_title  = isset( $tokens['{{site_title}}'] ) ? $tokens['{{site_title}}'] : '';
	$site_url    = isset( $event['site']['url'] ) ? (string) $event['site']['url'] : '';
	$attributes  = isset( $block['attrs'] ) && is_array( $block['attrs'] ) ? $block['attrs'] : array();
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
 * Render parsed email blocks to HTML.
 *
 * @param array<int, array<string, mixed>> $blocks            Parsed blocks.
 * @param array<string, mixed>             $event             Notification event.
 * @param array<string, int>               $template_context  Template context values.
 * @return string HTML output.
 */
function alpaca_render_notification_blocks( $blocks, $event, $template_context = array() ) {
	$output = '';

	foreach ( $blocks as $block ) {
		$block_name = isset( $block['blockName'] ) ? (string) $block['blockName'] : '';
		if ( 0 === strpos( $block_name, 'alpaca/email-' ) ) {
			$output .= alpaca_render_notification_placeholder_block( $block_name, $event, $template_context );
			continue;
		}

		if ( 'core/site-logo' === $block_name ) {
			$output .= alpaca_render_notification_site_logo_block( $block, $event, $template_context );
			continue;
		}

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

	preg_match_all( '/[^{}]*\.alpaca-notification-email[^{}]*\{[^}]*\}/', $css, $matches );
	if ( empty( $matches[0] ) ) {
		return '';
	}

	return implode( "\n", $matches[0] );
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
 * @param string               $body_template    Serialized body template.
 * @param array<string, mixed> $event            Notification event.
 * @param array<string, int>   $template_context Template context values.
 * @return string Rendered HTML body.
 */
function alpaca_render_notification_body( $body_template, $event, $template_context = array() ) {
	$tokens        = alpaca_get_notification_template_tokens( $event, $template_context );
	$body_template = strtr( $body_template, $tokens );
	$blocks        = parse_blocks( $body_template );
	$body_html     = alpaca_render_notification_blocks( $blocks, $event, $template_context );
	$css           = alpaca_get_notification_email_css();

	return '<!DOCTYPE html><html><head><meta charset="utf-8" /><style>' . $css . '</style></head><body><div class="alpaca-notification-email"><div class="alpaca-notification-email__inner">' . $body_html . '</div></div></body></html>';
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

	$context = isset( $template['context'] ) && is_array( $template['context'] ) ? $template['context'] : array();
	$subject = alpaca_render_notification_subject( $template['subject'], $event );
	$html    = alpaca_render_notification_body( $template['body'], $event, $context );
	$text    = wp_strip_all_tags( preg_replace( '/<\/?(p|div|br|li|h[1-6]|tr)>/i', "\n", $html ) );

	return array(
		'subject' => $subject,
		'html'    => $html,
		'text'    => trim( $text ),
	);
}
