import {format, isAfter, parse} from "date-fns";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- this function must handle an any type
export const getErrorMessage = (e: any) =>
	e instanceof Error ? e.message : String(e);

function fancifyIssueDate(issueDate:Date) {
    return format(issueDate, "eee, eo MMM yyyy")
}

export function generatePublicationMessage(issueDate:string, overrideDate?: Date) {
  const nowTime = overrideDate ??  new Date();
  const formattedDateToday = format(nowTime, "yyyy-MM-dd");

  const parsedIssueDate = parse(issueDate, "yyyy-MM-dd", new Date());

  if(formattedDateToday==issueDate) {
    return "This issue has been published and should be live in the app imminently"
  } else if(isAfter(parsedIssueDate, nowTime)) {
    return `This issue has been published and will launch after midnight GMT on ${fancifyIssueDate(parsedIssueDate)}`;
  } else {
    return `This issue has been published but its date is in the past so it can only be seen in the Fronts Preview tool`
  }
}
