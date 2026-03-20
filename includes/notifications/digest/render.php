<?php
/**
 * Daily digest render helpers.
 *
 * @package Alpaca
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Build token replacements for a daily digest payload.
 *
 * @param array<string, mixed> $payload Digest payload.
 * @return array<string, string> Token replacements.
 */
function alpaca_get_notification_daily_digest_template_tokens( $payload ) {
	$site_title   = wp_specialchars_decode( get_bloginfo( 'name' ), ENT_QUOTES );
	$site_tagline = wp_specialchars_decode( get_bloginfo( 'description' ), ENT_QUOTES );
	$counts       = isset( $payload['counts'] ) && is_array( $payload['counts'] ) ? $payload['counts'] : array();

	return array(
		'{{site_title}}'        => $site_title,
		'{{site_tagline}}'      => $site_tagline,
		'{{notifications_url}}' => alpaca_get_notification_preferences_url(),
		'{{digest_day}}'        => isset( $payload['digest_day'] ) ? (string) $payload['digest_day'] : '',
		'{{issue_count}}'       => isset( $counts['issues'] ) ? (string) absint( $counts['issues'] ) : '0',
		'{{activity_count}}'    => isset( $counts['activity'] ) ? (string) absint( $counts['activity'] ) : '0',
		'{{new_item_count}}'    => isset( $counts['new_items'] ) ? (string) absint( $counts['new_items'] ) : '0',
	);
}

/**
 * Render digest template text with token replacements.
 *
 * @param string               $template Template string.
 * @param array<string, mixed> $payload  Digest payload.
 * @return string Rendered string.
 */
function alpaca_render_notification_daily_digest_template_text( $template, $payload ) {
	$template = is_string( $template ) ? $template : '';

	return strtr( $template, alpaca_get_notification_daily_digest_template_tokens( $payload ) );
}

/**
 * Return the sample digest payload used by preview and test-send.
 *
 * @return array<string, mixed> Sample payload.
 */
function alpaca_get_notification_daily_digest_sample_payload() {
	$window_end   = current_time( 'mysql', true );
	$window_start = gmdate( 'Y-m-d H:i:s', strtotime( $window_end ) - DAY_IN_SECONDS );
	$sample_event = alpaca_get_notification_sample_event();

	$sample_event['recipient_subjects']  = array( 'created', 'mentioned' );
	$sample_event['stored_item']         = array(
		'id'          => 0,
		'created_gmt' => $window_end,
		'read_at_gmt' => '',
	);
	$sample_event['comment']['raw']      = __( 'This is a sample comment shown inside the daily digest. It is intentionally longer so the excerpt rendering can be previewed.', 'alpaca' );
	$sample_event['comment']['mentions'] = array(
		array(
			'id'           => get_current_user_id(),
			'slug'         => 'sample-user',
			'display_name' => __( 'Sample User', 'alpaca' ),
		),
	);

	$payload = array(
		'user_id'          => get_current_user_id(),
		'window_start_gmt' => $window_start,
		'window_end_gmt'   => $window_end,
		'digest_day'       => alpaca_get_notification_daily_digest_day_label( $window_end ),
		'deadline_watch'   => array(
			array(
				'id'             => 101,
				'title'          => __( 'Launch homepage refresh', 'alpaca' ),
				'slug'           => 'launch-homepage-refresh',
				'url'            => admin_url( 'admin.php?page=project-board&issue=launch-homepage-refresh' ),
				'deadline'       => wp_date( get_option( 'date_format' ), strtotime( '+1 day' ) ),
				'deadline_state' => 'soon',
				'headline'       => __( 'Due soon', 'alpaca' ),
				'meta'           => array(
					'status_label'     => __( 'In Progress', 'alpaca' ),
					'assignees'        => array(
						array(
							'name'   => __( 'Sam', 'alpaca' ),
							'avatar' => alpaca_avatar( get_current_user_id(), 24 ),
						),
					),
					'assignee_names'   => array( __( 'Sam', 'alpaca' ) ),
					'labels'           => array(
						array(
							'name'  => __( 'Design', 'alpaca' ),
							'color' => '#f97316',
						),
					),
					'label_names'      => array( __( 'Design', 'alpaca' ) ),
					'deadline_label'   => wp_date( get_option( 'date_format' ), strtotime( '+1 day' ) ),
					'deadline_text'    => __( 'Tomorrow', 'alpaca' ),
					'deadline_state'   => 'soon',
					'is_high_priority' => true,
				),
			),
		),
		'issue_activity'   => array(
			array(
				'issue'   => array(
					'id'    => isset( $sample_event['issue']['id'] ) ? (int) $sample_event['issue']['id'] : 0,
					'title' => isset( $sample_event['issue']['title'] ) ? (string) $sample_event['issue']['title'] : __( 'Sample issue title', 'alpaca' ),
					'slug'  => isset( $sample_event['issue']['slug'] ) ? (string) $sample_event['issue']['slug'] : 'sample-issue-title',
					'url'   => isset( $sample_event['issue']['url'] ) ? (string) $sample_event['issue']['url'] : admin_url( 'admin.php?page=project-board&issue=sample-issue-title' ),
					'meta'  => array(
						'status_label'     => __( 'In Progress', 'alpaca' ),
						'assignees'        => array(
							array(
								'name'   => __( 'Alex', 'alpaca' ),
								'avatar' => alpaca_avatar( get_current_user_id(), 24 ),
							),
						),
						'assignee_names'   => array( __( 'Alex', 'alpaca' ) ),
						'labels'           => array(
							array(
								'name'  => __( 'Design', 'alpaca' ),
								'color' => '#f97316',
							),
						),
						'label_names'      => array( __( 'Design', 'alpaca' ) ),
						'deadline_label'   => wp_date( get_option( 'date_format' ), strtotime( '+14 days' ) ),
						'deadline_text'    => wp_date( 'M j', strtotime( '+14 days' ) ),
						'deadline_state'   => '',
						'is_high_priority' => true,
					),
				),
				'entries' => array(
					alpaca_get_notification_digest_event_entry( $sample_event ),
					array(
						'event_family' => 'status_changes',
						'event_label'  => __( 'Status changed', 'alpaca' ),
						'actor_name'   => __( 'Sam', 'alpaca' ),
						'excerpt'      => '',
						'timestamp'    => gmdate( 'Y-m-d H:i:s', strtotime( $window_end ) - HOUR_IN_SECONDS ),
						'display_time' => wp_date( get_option( 'time_format' ), strtotime( '-1 hour' ) ),
						'priority'     => alpaca_get_notification_digest_activity_priority( 'status_changes' ),
					),
				),
				'total'   => 4,
				'more'    => 2,
				'latest'  => $window_end,
			),
		),
		'new_items'        => array(
			array(
				'id'       => 202,
				'title'    => __( 'Review new design request', 'alpaca' ),
				'slug'     => 'review-new-design-request',
				'url'      => admin_url( 'admin.php?page=project-board&issue=review-new-design-request' ),
				'headline' => __( 'Issue added', 'alpaca' ),
				'meta'     => array(
					'status_label'     => __( 'Inbox', 'alpaca' ),
					'assignees'        => array(),
					'assignee_names'   => array(),
					'labels'           => array(
						array(
							'name'  => __( 'Design', 'alpaca' ),
							'color' => '#f97316',
						),
					),
					'label_names'      => array( __( 'Design', 'alpaca' ) ),
					'deadline_label'   => '',
					'deadline_text'    => '',
					'deadline_state'   => '',
					'is_high_priority' => false,
				),
			),
		),
		'footer'           => array(),
		'counts'           => array(
			'issues'    => 1,
			'activity'  => 4,
			'new_items' => 1,
			'deadlines' => 1,
		),
	);

	return $payload;
}

/**
 * Render the calendar icon used in digest deadline badges.
 *
 * @return string HTML markup.
 */
function alpaca_render_notification_digest_calendar_icon_html() {
	$svg  = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true" focusable="false">';
	$svg .= '<path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M2 2a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z" />';
	$svg .= '<path d="M2.5 4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5zM11 7.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm-3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm-5 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5z" />';
	$svg .= '</svg>';

	return $svg;
}

/**
 * Render the priority badge used in digest layouts.
 *
 * @param string $label              Optional badge label text.
 * @param bool   $is_label_visible Whether to render the label as visible text.
 * @return string HTML markup.
 */
function alpaca_render_notification_digest_priority_badge_html( $label = '', $is_label_visible = true ) {
	$label            = is_string( $label ) ? $label : '';
	$is_label_visible = (bool) $is_label_visible;

	if ( '' === $label ) {
		$label = esc_html__( 'Priority', 'alpaca' );
	}

	$svg  = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true" focusable="false">';
	$svg .= '<path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4m.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2" />';
	$svg .= '</svg>';

	$label_class = '';

	if ( ! $is_label_visible ) {
		$label_class = ' class="screen-reader-text"';
	}

	return '<span class="alpaca-item-icon alpaca-item-priority-badge">' . $svg . '<span' . $label_class . '>' . esc_html( $label ) . '</span></span>';
}

/**
 * Render the deadline badge used in digest layouts.
 *
 * @param string $label Deadline label text.
 * @param string $state Deadline state.
 * @return string HTML markup.
 */
function alpaca_render_notification_digest_deadline_badge_html( $label, $state ) {
	$label = is_string( $label ) ? $label : '';
	$state = is_string( $state ) ? $state : '';

	if ( '' === $label ) {
		return '';
	}

	return '<span class="alpaca-item-icon alpaca-item-deadline alpaca-label-pill" data-deadline-state="' . esc_attr( $state ) . '">' . alpaca_render_notification_digest_calendar_icon_html() . esc_html( $label ) . '</span>';
}

/**
 * Render digest issue metadata pills to HTML.
 *
 * @param array<string, mixed> $meta Structured issue metadata.
 * @return string HTML markup.
 */
function alpaca_render_notification_digest_issue_meta_html( $meta ) {
	if ( empty( $meta ) || ! is_array( $meta ) ) {
		return '';
	}

	$items = array();

	if ( ! empty( $meta['is_high_priority'] ) ) {
		$items[] = alpaca_render_notification_digest_priority_badge_html();
	}

	if ( ! empty( $meta['labels'] ) && is_array( $meta['labels'] ) ) {
		$label_html = array();

		foreach ( $meta['labels'] as $label ) {
			$label_name  = isset( $label['name'] ) ? (string) $label['name'] : '';
			$label_color = isset( $label['color'] ) ? (string) $label['color'] : '#172b4d';
			if ( '' === $label_name ) {
				continue;
			}

			$label_html[] = '<span class="alpaca-item-label alpaca-label-pill" style="background-color:' . esc_attr( $label_color ) . ';color:#fff">' . esc_html( $label_name ) . '</span>';
		}

		if ( ! empty( $label_html ) ) {
			$items[] = '<span class="alpaca-item-labels">' . implode( '', $label_html ) . '</span>';
		}
	}

	if ( ! empty( $meta['assignees'] ) && is_array( $meta['assignees'] ) ) {
		$items[] = alpaca_render_notification_digest_assignees_html( $meta['assignees'] );
	}

	if ( ! empty( $meta['deadline_text'] ) ) {
		$items[] = alpaca_render_notification_digest_deadline_badge_html(
			(string) $meta['deadline_text'],
			isset( $meta['deadline_state'] ) ? (string) $meta['deadline_state'] : ''
		);
	}

	if ( empty( $items ) ) {
		return '';
	}

	return '<div class="alpaca-notification-digest-meta alpaca-item-datapoints">' . implode( '', $items ) . '</div>';
}

/**
 * Render digest assignee avatars to HTML.
 *
 * @param array<int, array<string, mixed>> $assignees Assignee data rows.
 * @return string HTML markup.
 */
function alpaca_render_notification_digest_assignees_html( $assignees ) {
	if ( empty( $assignees ) || ! is_array( $assignees ) ) {
		return '';
	}

	$html = '<span class="alpaca-item-assignees" data-assignees="' . esc_attr( (string) count( $assignees ) ) . '">';

	foreach ( $assignees as $assignee ) {
		$name   = isset( $assignee['name'] ) ? (string) $assignee['name'] : '';
		$avatar = isset( $assignee['avatar'] ) ? (string) $assignee['avatar'] : '';

		if ( '' === $name ) {
			continue;
		}

		$html .= '<span class="alpaca-user" title="' . esc_attr( $name ) . '">';

		if ( '' !== $avatar ) {
			$html .= '<span class="alpaca-user-avatar"><img src="' . esc_url( $avatar ) . '" alt="' . esc_attr( $name ) . '" /></span>';
		}

		$html .= '<span class="alpaca-user-name">' . esc_html( $name ) . '</span>';
		$html .= '</span>';
	}

	$html .= '</span>';

	return $html;
}

/**
 * Render a single digest event row.
 *
 * @param array<string, mixed> $entry Digest event entry.
 * @return string HTML markup.
 */
function alpaca_render_notification_digest_event_html( $entry ) {
	$event_label  = isset( $entry['event_label'] ) ? (string) $entry['event_label'] : '';
	$actor_name   = isset( $entry['actor_name'] ) ? trim( (string) $entry['actor_name'] ) : '';
	$display_time = isset( $entry['display_time'] ) ? (string) $entry['display_time'] : '';
	$excerpt      = isset( $entry['excerpt'] ) ? (string) $entry['excerpt'] : '';
	$headline     = $event_label;

	if ( '' !== $actor_name ) {
		$headline = sprintf(
			/* translators: 1: event label, 2: actor name. */
			esc_html__( '%1$s by %2$s', 'alpaca' ),
			$event_label,
			$actor_name
		);
	}

	$html  = '<li class="alpaca-notification-digest-event">';
	$html .= '<div class="alpaca-notification-digest-event__row">';
	$html .= '<span class="alpaca-notification-digest-event__headline">' . esc_html( $headline ) . '</span>';

	if ( '' !== $display_time ) {
		$html .= '<span class="alpaca-notification-digest-event__time">' . esc_html( $display_time ) . '</span>';
	}

	$html .= '</div>';

	if ( '' !== $excerpt ) {
		$html .= '<p class="alpaca-notification-digest-event__excerpt">' . esc_html( $excerpt ) . '</p>';
	}

	$html .= '</li>';

	return $html;
}

/**
 * Render deadline-watch rows to HTML.
 *
 * @param array<int, array<string, mixed>> $items Deadline watch items.
 * @return string HTML markup.
 */
function alpaca_render_notification_deadline_watch_html( $items ) {
	if ( empty( $items ) ) {
		return '<p class="alpaca-notification-digest-empty">' . esc_html__( 'No followed issues are overdue or due in the next two days.', 'alpaca' ) . '</p>';
	}

	$visible_items = array_slice( $items, 0, 3 );
	$more_count    = max( 0, count( $items ) - count( $visible_items ) );
	$html          = '<div class="alpaca-notification-digest-deadline-table-wrap"><table class="alpaca-notification-digest-deadline-table" role="presentation"><thead><tr><th scope="col">' . esc_html__( 'Issue', 'alpaca' ) . '</th><th scope="col" class="alpaca-notification-digest-deadline-table__priority"><span class="screen-reader-text">' . esc_html__( 'Priority', 'alpaca' ) . '</span></th><th scope="col">' . esc_html__( 'Due Date', 'alpaca' ) . '</th><th scope="col">' . esc_html__( 'Assignees', 'alpaca' ) . '</th><th scope="col">' . esc_html__( 'Status', 'alpaca' ) . '</th></tr></thead><tbody>';

	foreach ( $visible_items as $item ) {
		$meta           = isset( $item['meta'] ) && is_array( $item['meta'] ) ? $item['meta'] : array();
		$status_label   = isset( $meta['status_label'] ) ? (string) $meta['status_label'] : '';
		$assignees      = isset( $meta['assignees'] ) && is_array( $meta['assignees'] ) ? $meta['assignees'] : array();
		$deadline_state = isset( $meta['deadline_state'] ) ? (string) $meta['deadline_state'] : '';
		$deadline_text  = isset( $meta['deadline_text'] ) ? (string) $meta['deadline_text'] : '';
		$priority_html  = '';
		$title_html     = '<div class="alpaca-notification-digest-deadline-row__title-stack"><a href="' . esc_url( isset( $item['url'] ) ? (string) $item['url'] : '' ) . '">' . esc_html( isset( $item['title'] ) ? (string) $item['title'] : '' ) . '</a>';

		if ( ! empty( $meta['is_high_priority'] ) ) {
			$priority_html = alpaca_render_notification_digest_priority_badge_html( '', false );
		}

		$title_html .= '</div>';

		$html .= '<tr class="alpaca-notification-digest-deadline-row">';
		$html .= '<td class="alpaca-notification-digest-deadline-row__title">' . $title_html . '</td>';
		$html .= '<td class="alpaca-notification-digest-deadline-row__priority"><span class="alpaca-item-datapoints">' . $priority_html . '</span></td>';
		$html .= '<td class="alpaca-notification-digest-deadline-row__due">' . alpaca_render_notification_digest_deadline_badge_html( $deadline_text, $deadline_state ) . '</td>';
		$html .= '<td class="alpaca-notification-digest-deadline-row__assignees">' . ( ! empty( $assignees ) ? alpaca_render_notification_digest_assignees_html( $assignees ) : '—' ) . '</td>';
		$html .= '<td class="alpaca-notification-digest-deadline-row__status"><span class="alpaca-notification-digest-deadline-row__status-text">' . esc_html( '' !== $status_label ? $status_label : '—' ) . '</span></td>';
		$html .= '</tr>';
	}

	$html .= '</tbody></table></div>';

	if ( $more_count > 0 ) {
		$html .= '<p class="alpaca-notification-digest-card__more">' . sprintf(
			/* translators: %d: additional issue count. */
			esc_html__( '+%d more', 'alpaca' ),
			$more_count
		) . '</p>';
	}

	return $html;
}

/**
 * Render issue-activity groups to HTML.
 *
 * @param array<int, array<string, mixed>> $groups Issue groups.
 * @return string HTML markup.
 */
function alpaca_render_notification_digest_issue_activity_html( $groups ) {
	if ( empty( $groups ) ) {
		return '<p class="alpaca-notification-digest-empty">' . esc_html__( 'No followed issues had activity in the last 24 hours.', 'alpaca' ) . '</p>';
	}

	$html = '';
	foreach ( $groups as $group ) {
		$issue = isset( $group['issue'] ) && is_array( $group['issue'] ) ? $group['issue'] : array();
		$meta  = isset( $issue['meta'] ) && is_array( $issue['meta'] ) ? $issue['meta'] : array();

		$html .= '<article class="alpaca-notification-digest-card">';
		$html .= '<h4 class="alpaca-notification-digest-card__title"><a href="' . esc_url( isset( $issue['url'] ) ? (string) $issue['url'] : '' ) . '">' . esc_html( isset( $issue['title'] ) ? (string) $issue['title'] : '' ) . '</a></h4>';
		$html .= alpaca_render_notification_digest_issue_meta_html( $meta );
		$html .= '<ul class="alpaca-notification-digest-events">';
		foreach ( isset( $group['entries'] ) && is_array( $group['entries'] ) ? $group['entries'] : array() as $entry ) {
			$html .= alpaca_render_notification_digest_event_html( $entry );
		}
		$html .= '</ul>';
		if ( ! empty( $group['more'] ) ) {
			$html .= '<p class="alpaca-notification-digest-card__more">' . sprintf(
				/* translators: %d: additional event count. */
				esc_html__( '+%d more', 'alpaca' ),
				absint( $group['more'] )
			) . '</p>';
		}
		$html .= '</article>';
	}

	return $html;
}

/**
 * Render new-item rows to HTML.
 *
 * @param array<int, array<string, mixed>> $items New-item rows.
 * @return string HTML markup.
 */
function alpaca_render_notification_digest_new_items_html( $items ) {
	if ( empty( $items ) ) {
		return '';
	}

	$html = '';
	foreach ( $items as $item ) {
		$html .= '<article class="alpaca-notification-digest-card alpaca-notification-digest-card--new-item">';
		$html .= '<h4 class="alpaca-notification-digest-card__title"><a href="' . esc_url( isset( $item['url'] ) ? (string) $item['url'] : '' ) . '">' . esc_html( isset( $item['title'] ) ? (string) $item['title'] : '' ) . '</a></h4>';
		$html .= '<p class="alpaca-notification-digest-card__headline">' . esc_html( isset( $item['headline'] ) ? (string) $item['headline'] : '' ) . '</p>';
		$html .= alpaca_render_notification_digest_issue_meta_html( isset( $item['meta'] ) && is_array( $item['meta'] ) ? $item['meta'] : array() );
		$html .= '</article>';
	}

	return $html;
}

/**
 * Render a custom Alpaca daily digest placeholder block.
 *
 * @param string                $block_name Block name.
 * @param array<string, mixed>  $payload    Digest payload.
 * @param array<string, string> $template  Digest template values.
 * @return string HTML output.
 */
function alpaca_render_notification_daily_digest_placeholder_block( $block_name, $payload, $template ) {
	if ( 'alpaca/digest-site-icon' === $block_name ) {
		$site_icon  = alpaca_get_notification_site_icon_url();
		$site_title = wp_specialchars_decode( get_bloginfo( 'name' ), ENT_QUOTES );

		if ( '' === $site_icon ) {
			return '';
		}

		return '<div class="alpaca-notification-site-icon-block"><img class="alpaca-notification-site-icon" src="' . esc_url( $site_icon ) . '" alt="' . esc_attr( $site_title ) . '" /></div>';
	}

	if ( 'alpaca/digest-deadline-watch' === $block_name ) {
		$summary_html = apply_filters( 'alpaca_daily_digest_summary_block', '', $payload, $template );
		$before_html  = apply_filters( 'alpaca_daily_digest_pre_sections_html', '', $payload, $template );
		$html         = '';

		if ( '' !== $summary_html ) {
			$html .= $summary_html;
		}

		if ( '' !== $before_html ) {
			$html .= $before_html;
		}

		$html .= '<section class="alpaca-notification-digest-section"><h3>' . esc_html__( 'Issues Falling Due', 'alpaca' ) . '</h3>' . alpaca_render_notification_deadline_watch_html( isset( $payload['deadline_watch'] ) && is_array( $payload['deadline_watch'] ) ? $payload['deadline_watch'] : array() ) . '</section>';

		return $html;
	}

	if ( 'alpaca/digest-issue-activity' === $block_name ) {
		return '<section class="alpaca-notification-digest-section"><h3>' . esc_html__( 'My Issues', 'alpaca' ) . '</h3>' . alpaca_render_notification_digest_issue_activity_html( isset( $payload['issue_activity'] ) && is_array( $payload['issue_activity'] ) ? $payload['issue_activity'] : array() ) . '</section>';
	}

	if ( 'alpaca/digest-new-items' === $block_name ) {
		$html = '';

		if ( ! empty( $payload['new_items'] ) && is_array( $payload['new_items'] ) ) {
			$html .= '<section class="alpaca-notification-digest-section"><h3>' . esc_html__( 'New Issues', 'alpaca' ) . '</h3>' . alpaca_render_notification_digest_new_items_html( $payload['new_items'] ) . '</section>';
		}

		$after_html = apply_filters( 'alpaca_daily_digest_post_sections_html', '', $payload, $template );
		if ( '' !== $after_html ) {
			$html .= $after_html;
		}

		return $html;
	}

	return '';
}

/**
 * Prepare a parsed daily digest block for server rendering.
 *
 * @param array<string, mixed>  $block    Parsed block.
 * @param array<string, mixed>  $payload  Digest payload.
 * @param array<string, string> $template Digest template values.
 * @return array<string, mixed> Prepared parsed block.
 */
function alpaca_prepare_notification_daily_digest_block_for_render( $block, $payload, $template ) {
	$block_name = isset( $block['blockName'] ) ? (string) $block['blockName'] : '';

	if ( 0 === strpos( $block_name, 'alpaca/digest-' ) ) {
		$html = alpaca_render_notification_daily_digest_placeholder_block( $block_name, $payload, $template );

		return alpaca_create_notification_html_block( $html );
	}

	if ( isset( $block['innerBlocks'] ) && is_array( $block['innerBlocks'] ) && ! empty( $block['innerBlocks'] ) ) {
		$block['innerBlocks'] = alpaca_prepare_notification_daily_digest_blocks_for_render( $block['innerBlocks'], $payload, $template );
	}

	return $block;
}

/**
 * Prepare parsed daily digest blocks for server rendering.
 *
 * @param array<int, array<string, mixed>> $blocks   Parsed blocks.
 * @param array<string, mixed>             $payload  Digest payload.
 * @param array<string, string>            $template Digest template values.
 * @return array<int, array<string, mixed>> Prepared parsed blocks.
 */
function alpaca_prepare_notification_daily_digest_blocks_for_render( $blocks, $payload, $template ) {
	$prepared = array();

	foreach ( $blocks as $block ) {
		$prepared[] = alpaca_prepare_notification_daily_digest_block_for_render( $block, $payload, $template );
	}

	return $prepared;
}

/**
 * Render parsed daily digest blocks to HTML.
 *
 * @param array<int, array<string, mixed>> $blocks   Parsed blocks.
 * @param array<string, mixed>             $payload  Digest payload.
 * @param array<string, string>            $template Digest template values.
 * @return string HTML output.
 */
function alpaca_render_notification_daily_digest_blocks( $blocks, $payload, $template ) {
	$output = '';
	$blocks = alpaca_prepare_notification_daily_digest_blocks_for_render( $blocks, $payload, $template );

	foreach ( $blocks as $block ) {
		$output .= render_block( $block );
	}

	return $output;
}

/**
 * Render the daily digest email body.
 *
 * @param array<string, mixed>  $payload  Digest payload.
 * @param array<string, string> $template Digest template values.
 * @return string HTML email body.
 */
function alpaca_render_notification_daily_digest_body( $payload, $template ) {
	$template      = is_array( $template ) ? $template : alpaca_get_notification_daily_digest_template();
	$body_template = isset( $template['body'] ) ? (string) $template['body'] : alpaca_get_notification_daily_digest_body_template_default();
	$body_template = strtr( $body_template, alpaca_get_notification_daily_digest_template_tokens( $payload ) );
	$blocks        = parse_blocks( $body_template );
	$body_html     = alpaca_render_notification_daily_digest_blocks( $blocks, $payload, $template );

	return alpaca_wrap_notification_email_html(
		$body_html,
		array( 'alpaca-notification-digest-email' )
	);
}

/**
 * Render the daily digest subject.
 *
 * @param array<string, mixed>  $payload   Digest payload.
 * @param array<string, string> $template Digest template values.
 * @return string Rendered subject.
 */
function alpaca_render_notification_daily_digest_subject( $payload, $template ) {
	$template = is_array( $template ) ? $template : alpaca_get_notification_daily_digest_template();
	$subject  = isset( $template['subject'] ) ? (string) $template['subject'] : alpaca_get_notification_daily_digest_subject_template_default();

	return alpaca_render_notification_daily_digest_template_text( $subject, $payload );
}

/**
 * Render a daily digest message object.
 *
 * @param array<string, mixed>       $payload   Digest payload.
 * @param array<string, string>|null $template Optional template values.
 * @return array<string, string> Message object.
 */
function alpaca_render_notification_daily_digest_message( $payload, $template = null ) {
	if ( ! is_array( $template ) ) {
		$template = alpaca_get_notification_daily_digest_template();
	}

	$subject = alpaca_render_notification_daily_digest_subject( $payload, $template );
	$html    = alpaca_render_notification_daily_digest_body( $payload, $template );

	return alpaca_build_notification_message_payload( $subject, $html );
}

/**
 * Send a daily digest through the email channel.
 *
 * @param int                   $user_id      User ID.
 * @param array<string, mixed>  $preferences Notification preferences.
 * @param array<string, string> $message     Message payload.
 * @return bool True on success.
 */
function alpaca_send_notification_daily_digest_email( $user_id, $preferences, $message ) {
	$email = alpaca_get_notification_effective_email( $user_id, $preferences );

	return alpaca_send_notification_html_email( $email, $message );
}

/**
 * Dispatch a daily digest message for one channel.
 *
 * @param int                   $user_id      User ID.
 * @param string                $channel      Channel key.
 * @param array<string, mixed>  $preferences Notification preferences.
 * @param array<string, mixed>  $payload     Structured digest payload.
 * @param array<string, string> $template    Digest template values.
 * @return bool True on success.
 */
function alpaca_dispatch_notification_daily_digest_channel( $user_id, $channel, $preferences, $payload, $template ) {
	$message = alpaca_render_notification_daily_digest_message( $payload, $template );

	/**
	 * Filter the rendered daily digest message for a specific channel.
	 *
	 * @param array<string, string> $message     Message payload.
	 * @param string                $channel     Channel key.
	 * @param int                   $user_id      User ID.
	 * @param array<string, mixed>  $preferences Notification preferences.
	 * @param array<string, mixed>  $payload     Structured digest payload.
	 */
	$message = apply_filters( 'alpaca_daily_digest_channel_message', $message, $channel, $user_id, $preferences, $payload );

	if ( 'email' === $channel ) {
		return alpaca_send_notification_daily_digest_email( $user_id, $preferences, $message );
	}

	$handled = apply_filters( 'alpaca_daily_digest_channel_dispatch', null, $channel, $user_id, $preferences, $payload, $message );

	return is_bool( $handled ) ? $handled : false;
}
