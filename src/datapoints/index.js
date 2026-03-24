import { priorityDatapointRegistration } from './priorityDatapoint';
import { assigneesDatapointRegistration } from './assigneesDatapoint';
import { labelsDatapointRegistration } from './labelsDatapoint';
import { lastCommentActivityDatapointRegistration } from './lastCommentActivityDatapoint';
import { commentCountDatapointRegistration } from './commentCountDatapoint';
import { checklistProgressDatapointRegistration } from './checklistProgressDatapoint';
import { deadlineDatapointRegistration } from './deadlineDatapoint';

export const datapointRegistrations = [
  priorityDatapointRegistration,
  assigneesDatapointRegistration,
  labelsDatapointRegistration,
  lastCommentActivityDatapointRegistration,
  commentCountDatapointRegistration,
  checklistProgressDatapointRegistration,
  deadlineDatapointRegistration,
];
