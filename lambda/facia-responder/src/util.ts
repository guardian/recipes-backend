import format from "date-fns/format";
import {parse} from "date-fns";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- this function must handle an any type
export const getErrorMessage = (e: any) =>
	e instanceof Error ? e.message : String(e);

function fancifyIssueDate(issueDate:string) {
  try {
    const parsed = parse(issueDate, "yyyy-MM-dd", new Date());
    return format(parsed, "eee, eo MMM yyyy")
  } catch(err) {
    console.error(err);
    return "(invalid date)"
  }
}

export function generatePublicationMessage(issueDate:string) {
  const nowTime = new Date();
  const formattedDateToday = format(nowTime, "yyyy-MM-dd");

  if(formattedDateToday==issueDate) {
    return "This issue has been published and should be live in the app imminently"
  } else {
    return `This issue has been published and will launch after midnight GMT on ${fancifyIssueDate(issueDate)}`;
  }
}
