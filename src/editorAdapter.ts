import { OPDSEntry } from "opds-feed-parser";

export default function adapter(data: OPDSEntry): BookData {
  let hideLink = data.links.find(link => {
    return link.rel === "http://librarysimplified.org/terms/rel/hide";
  });

  let restoreLink = data.links.find(link => {
    return link.rel === "http://librarysimplified.org/terms/rel/restore";
  });

  let editLink = data.links.find(link => {
    return link.rel === "edit";
  });

  return {
    title: data.title,
    hideLink: hideLink,
    restoreLink: restoreLink,
    editLink: editLink
  };
}