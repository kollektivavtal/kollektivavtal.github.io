import { Breadcrumbs } from "@svenskamodellen/components/Breadcrumb";
import { Container } from "@svenskamodellen/components/Container";
import { Main } from "@svenskamodellen/components/Main";
import { Section } from "@svenskamodellen/components/Section";
import { TopLevelHeading } from "@svenskamodellen/components/TopLevelHeading";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ThumbnailRow, ThumbnailRowList } from "@/components/ThumbnailCard";
import { getAvtalSlugs, parseAvtal } from "@/lib/avtal";

export const dynamic = "force-static";

export function generateStaticParams() {
  return getAvtalSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  if (!getAvtalSlugs().includes(slug)) {
    return {};
  }

  return {
    title: parseAvtal(slug).name,
  };
}

export default async function AvtalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!getAvtalSlugs().includes(slug)) {
    notFound();
  }

  const avtal = parseAvtal(slug);

  return (
    <>
      <Breadcrumbs>
        {{
          "https://svenskamodellen.github.io/": "Svenska modellen",
          "/": "Kollektivavtal",
          [`/${avtal.slug}`]: avtal.name,
        }}
      </Breadcrumbs>
      <Main>
        <Container className="flex w-full flex-col gap-y-8">
          <header className="flex flex-col gap-y-8">
            <TopLevelHeading text={avtal.name} />
            {avtal.description.length > 0 && (
              <div className="flex max-w-prose flex-col gap-y-4">
                {avtal.description.map((paragraph, index) => (
                  <p key={index} className="body-text leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            )}

            <nav aria-label="Innehåll" className="flex flex-col gap-y-2">
              <h2 className="section-heading">Innehåll</h2>
              <ul className="flex flex-col font-lilex">
                {[...new Set(avtal.documents.map((document) => document.year))].map((year) => (
                  <li
                    key={year}
                    className="relative py-1 pl-6 before:absolute before:left-0 before:top-0 before:h-[1.1rem] before:w-4 before:rounded-bl-[0.2rem] before:border-b before:border-l before:border-slate-300 after:absolute after:left-0 after:top-0 after:h-full after:w-px after:bg-slate-300 last:after:hidden dark:before:border-slate-600 dark:after:bg-slate-600"
                  >
                    <a className="text-link underline" href={`#${year}`}>
                      {year}
                    </a>
                  </li>
                ))}
                {avtal.forbund.length > 0 && (
                  <li className="relative py-1 pl-6 before:absolute before:left-0 before:top-0 before:h-[1.1rem] before:w-4 before:rounded-bl-[0.2rem] before:border-b before:border-l before:border-slate-300 after:absolute after:left-0 after:top-0 after:h-full after:w-px after:bg-slate-300 last:after:hidden dark:before:border-slate-600 dark:after:bg-slate-600">
                    <a className="text-link underline" href="#forbund">
                      Förbund
                    </a>
                  </li>
                )}
                {avtal.sources.length > 0 && (
                  <li className="relative py-1 pl-6 before:absolute before:left-0 before:top-0 before:h-[1.1rem] before:w-4 before:rounded-bl-[0.2rem] before:border-b before:border-l before:border-slate-300 after:absolute after:left-0 after:top-0 after:h-full after:w-px after:bg-slate-300 last:after:hidden dark:before:border-slate-600 dark:after:bg-slate-600">
                    <a className="text-link underline" href="#kallor">
                      Källor
                    </a>
                  </li>
                )}
              </ul>
            </nav>
          </header>

          {[...new Set(avtal.documents.map((document) => document.year))].map((year) => (
            <Section key={year}>
              <h2 id={year} className="scroll-mt-20 section-heading">{year}</h2>
              <ThumbnailRowList>
                {avtal.documents
                  .filter((document) => document.year === year)
                  .map((document) => (
                    <ThumbnailRow
                      key={document.url}
                      href={document.url}
                      src={document.thumbnail}
                      title={document.title}
                      description={document.description}
                    />
                  ))}
              </ThumbnailRowList>
            </Section>
          ))}

          {avtal.forbund.length > 0 && (
            <Section className="w-full overflow-visible">
              <h2 id="forbund" className="scroll-mt-20 section-heading">Förbund</h2>
              <ul className="flex w-full flex-col gap-y-4">
                {avtal.forbund.map((forbund) => (
                  <li
                    key={forbund.url}
                    className="group relative flex max-w-prose flex-col items-start gap-y-2 xxs:flex-row xxs:items-center xxs:gap-x-4 sm:gap-x-6"
                  >
                    <div className="aspect-square w-24 shrink-0 overflow-hidden rounded-md bg-white p-1.5 shadow-sm ring-1 ring-black/5 transition-shadow duration-150 group-hover:shadow-md sm:w-40 dark:ring-white/40">
                      <img
                        alt=""
                        className="h-full w-full object-contain"
                        src={forbund.logo}
                      />
                    </div>
                    <span className="flex flex-col">
                      <a
                        className="section-heading text-link underline after:absolute after:inset-0"
                        href={forbund.url}
                      >
                        {forbund.title}
                      </a>
                    </span>
                  </li>
                ))}
              </ul>
            </Section>
          )}
          {avtal.sources.length > 0 && (
            <Section>
              <h2 id="kallor" className="scroll-mt-20 section-heading">Källor</h2>
              <ol
                className="flex list-outside list-decimal flex-col gap-y-1 pl-[2em]"
              >
                {avtal.sources.map((link, index) => (
                  <li key={index} className="break-all max-w-prose">
                    <a className="text-link underline body-text max-w-prose" href={link}>
                      {link}
                    </a>
                  </li>
                ))}
              </ol>
            </Section>
          )}
        </Container>
      </Main>
    </>
  );
}
