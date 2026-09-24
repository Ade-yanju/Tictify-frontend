import OrganizerChrome from "./OrganizerChrome";

export default function OrganizerShell({ active, title, subtitle, children }) {
  return (
    <OrganizerChrome active={active} title={title} subtitle={subtitle} legacyPrefix="org">
      {children}
    </OrganizerChrome>
  );
}
