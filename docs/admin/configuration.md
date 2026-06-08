# Configuration

Administrators manage site-wide Alpaca Issue Tracker settings under Project Board > Configure.

## Statuses

The Statuses tab controls board columns.

Use it to:

- Create a new status (column).
- Rename or delete existing statuses.
- Manage the order of columns shown on the board.

Alpaca Issue Tracker creates a set of default statuses on activation. You can add, rename or remove these to create your desired column structure. There is no limit on the number of statuses you can have on a board.

Alpaca Issue Tracker cannot function without statuses. If you lose or delete all statuses, you will be prompted to restore the default set.

## Cards

The Cards tab controls which datapoints appear on issue cards.

Use this to decide how much information appears at a glance on the board, such as assignees, labels, or deadlines.

## Labels

The Labels tab manages issue labels.

Labels can be used to filter the board view, or to set notification preferences.

Each label has an associated color chosen from a predefined palette. Label colors are stored on label term meta and normalized before use.

## Deleted Items

Issues and checklist items can be deleted individually at any time. The final status column also includes a Delete All option, for easy board clean-up.

The Deleted Items tab helps administrators find and restore deleted issues or checklist items when they are still available in trash.

Restored issues will be returned to active board usage, with all associated metadata and timeline entries. The restoration action is also recorded in the timeline.

## Settings

The Settings tab includes site-wide controls such as:

- Context capture.
- Debugging messages.

If you want to use Alpaca as a standard kanban board, without front-end issue reporting, you can uncheck the 'Context Capture' option. Issues can still be created directly on the Project Board screen.

## Email Templates

Email Templates are managed via a separate admin screen under Project Board.

This function allows an administrator to adapt the block-based template used to generate instant notification and daily digest emails for all users.

Template blocks, placeholders, and storage are documented in [Email Templates](email-templates.md).
