import { Breadcrumbs } from "@svenskamodellen/components/Breadcrumb";
import { Container } from "@svenskamodellen/components/Container";
import { Main } from "@svenskamodellen/components/Main";
import { TopLevelHeading } from "@svenskamodellen/components/TopLevelHeading";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bidra med avtal",
  description: "Var en del av offentlighetsprincipen.",
};

export default function Bidra() {
  return (
    <>
      <Breadcrumbs>
        {{
          "https://svenskamodellen.github.io/": "Svenska modellen",
          "/": "Kollektivavtal",
          "/bidra": "Bidra",
        }}
      </Breadcrumbs>
      <Main>
        <Container className="flex flex-col items-start space-y-8">
          <TopLevelHeading
            text="Bidra med avtal"
            subtext="Var en del av offentlighetsprincipen"
          />

          <div className="flex max-w-prose flex-col space-y-6">
            <p className="body-text">
              Målbilden med Kollektivavtalsarkivet är att göra det enkelt att
              bläddra bland, hitta och forska i kollektivavtal. Kollektivavtalen
              är en viktig del av det svenska samhället, och det borde finnas en
              plats där vem som helst kan läsa dem online.
            </p>

            <p className="body-text">
              I dag ligger alldeles för många kollektivavtal gömda bakom
              inloggningssidor, trots att de inte alls är hemliga dokument. Att
              de är så svåra att komma åt gör det onödigt krångligt att ta del av
              något som egentligen angår oss alla.

 Att exempelvis minimilönen i olika branscher inte går att hitta en ordentlig förstahandskälla för är ett transparensproblem som inte är en nödvändig följd av partsmodellen.            </p>

            <p className="body-text">
              Du som har tillgång till kollektivavtal genom medlemskap i eller anställning hos ett fackförbund kan hjälpa till att bygga ett fritt och öppet digitalt arkiv.
              Skicka gärna de avtal du har tillgång till till{" "}
              <a
                className="text-link underline"
                href="mailto:henry@catalinismith.se"
              >
                henry@catalinismith.se
              </a>
              .
            </p>
          </div>
        </Container>
      </Main>
    </>
  );
}
