import format from "date-fns/format";
import {generatePublicationMessage} from "./util";

describe("generatePublicationMessage", ()=>{
  it("should generate a different message if the issueDate is today", ()=>{
    const nowTime = new Date();
    const formattedDateToday = format(nowTime, "yyyy-MM-dd");
    const result = generatePublicationMessage(formattedDateToday);
    expect(result).toEqual("This issue has been published and should be live in the app imminently");
  });

  it("should include the issue date if the issueDate is not today", ()=>{
    const result = generatePublicationMessage("2023-02-10");
    expect(result).toContain("Fri, 6th Feb 2023")
  })
})
