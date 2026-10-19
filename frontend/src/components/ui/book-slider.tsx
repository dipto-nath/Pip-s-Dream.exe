import React from 'react';
import HTMLFlipBook from 'react-pageflip';

export interface PokemonItem {
  id: string;
  name: string;
  types: string[];
  description: string;
}

const defaultPokemonData: PokemonItem[] = [
  {
    id: "006",
    name: "Charizard",
    types: ["Fire", "Flying"],
    description: "Flies in search of strong opponents. Breathes extremely hot fire that melts anything, but never uses it on weaker foes."
  },
  {
    id: "025",
    name: "Pikachu",
    types: ["Electric"],
    description: "When Pikachu meet, they touch tails to exchange electricity as a greeting."
  },
  {
    id: "125",
    name: "Electabuzz",
    types: ["Electric"],
    description: "Often kept at power plants to regulate electricity. Competes with others to attract lightning during storms."
  },
  {
    id: "185",
    name: "Sudowoodo",
    types: ["Rock"],
    description: "Despite looking like a tree, its body is more like rock. Hates water and hides when it rains."
  },
  {
    id: "448",
    name: "Lucario",
    types: ["Fighting", "Steel"],
    description: "Can read thoughts and movements by sensing others' aura. No foe can hide from Lucario."
  },
  {
    id: "658",
    name: "Greninja",
    types: ["Water", "Dark"],
    description: "Creates throwing stars from compressed water that can slice through metal when thrown at high speed."
  },
  {
    id: "491",
    name: "Darkrai",
    types: ["Dark"],
    description: "A legendary Pokémon that appears on moonless nights, putting people to sleep and giving them nightmares."
  }
];

export interface BookSliderProps {
  data?: PokemonItem[];
  className?: string;
}

// In react-pageflip, pages must forward their ref to a DOM node
const FlipPage = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, className, ...rest }, ref) => {
    return (
      <div ref={ref} className={className} {...rest}>
        {children}
      </div>
    );
  }
);
FlipPage.displayName = 'FlipPage';

export function BookSlider({ data = defaultPokemonData, className = '' }: BookSliderProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const FlipBookComponent = HTMLFlipBook as any;

  return (
    <div className={`book-slider-wrapper flex justify-center items-center py-6 ${className}`}>
      <FlipBookComponent
        width={370}
        height={500}
        maxShadowOpacity={0.5}
        drawShadow={true}
        showCover={true}
        size="fixed"
        className="book-slider-flipbook"
        style={{}}
      >
        <FlipPage className="page" style={{ background: 'transparent' }}>
          <div className="page-content cover flex items-center justify-center h-full rounded-lg p-6" style={{ backgroundColor: "var(--surface-inset)", color: "var(--body-text)" }}>
            <img
              src="https://cdn.21st.dev/assets/mirror/9b/9b356095a31f462dd8f0e123e2713158edf08749348c0c06c0641b59152b180f.svg"
              alt="Pokémon Logo"
              className="pokemon-logo w-48 h-auto"
            />
          </div>
        </FlipPage>

        {data.map((pokemon) => (
          <FlipPage className="page" key={pokemon.id}>
            <div className="page-content p-6 h-full flex flex-col items-center justify-center rounded-lg shadow-inner" style={{ backgroundColor: "var(--paper-bg)", color: "var(--paper-text)" }}>
              <div className="pokemon-container text-center">
                <img
                  src={`https://www.pokemon.com/static-assets/content-assets/cms2/img/pokedex/full/${pokemon.id}.png`}
                  alt={pokemon.name}
                  className="w-40 h-40 object-contain mx-auto mb-4"
                />
                <div className="pokemon-info">
                  <h2 className="pokemon-name text-2xl font-bold" style={{ color: "var(--paper-text)" }}>{pokemon.name}</h2>
                  <p className="pokemon-number text-sm font-mono mb-2" style={{ color: "var(--text-muted)" }}>#{pokemon.id}</p>
                  <div className="flex gap-2 justify-center mb-3">
                    {pokemon.types.map((type) => (
                      <span
                        key={type}
                        className={`pokemon-type type-${type.toLowerCase()} text-xs uppercase px-2.5 py-1 rounded font-semibold`}
                        style={{ backgroundColor: "var(--surface-inset)", color: "var(--text-muted)" }}
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                  <p className="pokemon-description text-xs leading-relaxed max-w-xs" style={{ color: "var(--text-muted)" }}>{pokemon.description}</p>
                </div>
              </div>
            </div>
          </FlipPage>
        ))}
      </FlipBookComponent>
    </div>
  );
}

export default BookSlider;
