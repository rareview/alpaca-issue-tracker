/* eslint-disable jsdoc/check-line-alignment */
import { parseWpDateValue } from './date';

/**
 * Resolve an active filter object for a given type.
 *
 * @param {Object|null} activeFilter Active filter payload.
 * @param {string} type Filter type to resolve.
 * @return {Object|null} Resolved filter or null.
 */
export function getActiveFilter(activeFilter, type) {
  if (!activeFilter || typeof activeFilter !== 'object') {
    return null;
  }

  if (activeFilter[type] && typeof activeFilter[type] === 'object') {
    return activeFilter[type];
  }

  if (activeFilter.type === type) {
    return activeFilter;
  }

  return null;
}

function resolveAssigneeDisplayName(assignee) {
  if (!assignee || typeof assignee !== 'object') {
    return '';
  }

  return String(
    assignee.displayName ||
      assignee.display_name ||
      assignee.name ||
      assignee.slug ||
      '',
  );
}

/**
 * Build label and assignee option lists from board containers.
 *
 * @param {Array} containers Board containers.
 * @return {Object} { labels, assignees }
 */
export function buildBoardOptions(containers) {
  const labelsMap = new Map();
  const assigneesMap = new Map();

  (Array.isArray(containers) ? containers : []).forEach((container) => {
    const items = Array.isArray(container.items) ? container.items : [];

    items.forEach((item) => {
      const itemLabels = Array.isArray(item.labels) ? item.labels : [];
      itemLabels.forEach((label) => {
        if (!label || typeof label !== 'object') {
          return;
        }

        const labelName = label.name ? String(label.name) : '';
        const labelSlug = label.slug ? String(label.slug) : '';
        const labelTermId =
          typeof label.term_id !== 'undefined' && label.term_id !== null
            ? String(label.term_id)
            : '';

        const labelKey = labelTermId || labelSlug || labelName.toLowerCase();
        if (!labelKey || labelsMap.has(labelKey)) {
          return;
        }

        labelsMap.set(labelKey, {
          termId: labelTermId,
          slug: labelSlug,
          name: labelName,
          color: label.color || null,
        });
      });

      const itemAssignees = Array.isArray(item.assignees) ? item.assignees : [];
      itemAssignees.forEach((assignee) => {
        if (
          !assignee ||
          typeof assignee.id === 'undefined' ||
          assignee.id === null
        ) {
          return;
        }

        const assigneeId = String(assignee.id);
        const existingAssignee = assigneesMap.get(assigneeId);

        if (
          existingAssignee &&
          existingAssignee.displayName &&
          existingAssignee.avatar
        ) {
          return;
        }

        assigneesMap.set(assigneeId, {
          id: assigneeId,
          displayName:
            resolveAssigneeDisplayName(assignee) ||
            existingAssignee?.displayName ||
            '',
          avatar:
            assignee.avatar ||
            (assignee.avatar_urls && assignee.avatar_urls[96]) ||
            existingAssignee?.avatar ||
            null,
        });
      });
    });
  });

  return {
    labels: Array.from(labelsMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    ),
    assignees: Array.from(assigneesMap.values()).sort((a, b) =>
      a.displayName.localeCompare(b.displayName),
    ),
  };
}

/**
 * Compute deadline state for a raw WP date value.
 * Returns 'late' | 'today' | 'soon' | 'future' or null when invalid.
 *
 * @param {string|null} rawDate Raw date value from meta.
 * @return {string|null} Deadline state.
 */
export function computeDeadlineState(rawDate) {
  if (!rawDate) {
    return null;
  }

  const deadline = parseWpDateValue(rawDate, {
    treatDateOnlyAsLocalNoon: true,
  });

  if (!deadline || Number.isNaN(deadline.getTime())) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 'late';
  }

  if (diffDays === 0) {
    return 'today';
  }

  if (diffDays < 8) {
    return 'soon';
  }

  return 'future';
}
