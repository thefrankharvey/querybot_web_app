import type { ReactNode } from "react";
import { cn } from "@/app/utils";
import { Badge } from "@/app/ui-primitives/badge";
import { Separator } from "@/app/ui-primitives/separator";
import { targetAudienceOptions } from "@/app/constants";
import type { ProjectProfile } from "@/app/utils/project-profile";
import { formatTraitLabel } from "@/lib/traits";

function Detail({
  label,
  children,
  wide,
}: {
  label: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-2", wide && "sm:col-span-2")}>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-base font-medium text-accent break-words">
        {children || "Not added yet"}
      </dd>
    </div>
  );
}

function Traits({ values }: { values: string[] }) {
  return values.length ? (
    <div className="flex flex-wrap gap-2">
      {values.map((value) => (
        <Badge key={value}>{formatTraitLabel(value)}</Badge>
      ))}
    </div>
  ) : (
    <span className="text-sm text-muted-foreground">Not added yet</span>
  );
}

export function ProjectProfileDetails({
  profile,
}: {
  profile: ProjectProfile;
}) {
  const { form } = profile;
  const comps = form.comps.filter((comp) => comp.title || comp.author);
  return (
    <div className="flex flex-col gap-8">
      <section
        aria-labelledby="manuscript-details-heading"
        className="flex flex-col gap-5"
      >
        <h3
          id="manuscript-details-heading"
          className="text-lg font-semibold text-accent"
        >
          Manuscript details
        </h3>
        <dl className="grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2">
          <Detail label="Type">
            {form.non_fiction ? "Nonfiction" : "Fiction"}
          </Detail>
          <Detail label="Genre">
            {form.genre ? formatTraitLabel(form.genre) : null}
          </Detail>
          <Detail label="Format">
            {form.format ? formatTraitLabel(form.format) : null}
          </Detail>
          <Detail label="Target audience">
            {targetAudienceOptions.find(
              (option) => option.value === form.target_audience,
            )?.label || form.target_audience}
          </Detail>
          <Detail label="Subgenres" wide>
            <Traits values={form.subgenres} />
          </Detail>
        </dl>
      </section>
      <Separator />
      <section
        aria-labelledby="profile-themes-heading"
        className="flex flex-col gap-3"
      >
        <h3
          id="profile-themes-heading"
          className="text-lg font-semibold text-accent"
        >
          Themes
        </h3>
        <Traits values={form.themes} />
      </section>
      <Separator />
      <section
        aria-labelledby="profile-comps-heading"
        className="flex flex-col gap-4"
      >
        <h3
          id="profile-comps-heading"
          className="text-lg font-semibold text-accent"
        >
          Comparable books
        </h3>
        {comps.length ? (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {comps.map((comp, index) => (
              <li
                key={index}
                className="flex min-w-0 flex-col gap-1 border-l-2 border-accent/20 pl-4"
              >
                <p className="font-serif text-xl text-accent break-words">
                  {comp.title || "Untitled book"}
                </p>
                <p className="text-sm text-muted-foreground break-words">
                  {comp.author || "Author not added"}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            No comparable books added yet.
          </p>
        )}
      </section>
    </div>
  );
}
