import { POKEAPI_URL } from "$env/static/private";
import { json } from "@sveltejs/kit";

const MAX_DEX_NO = 1000;

type Pokemon = {
  id: number;
  name: string;
}
let pokemon: Pokemon[] = [];

export const GET = async () => {
  if (pokemon.length === 0) {
    console.log('Fetching pokemon...');

    const response = await fetch(`${POKEAPI_URL}/pokemon?limit=-1`);
    const data = await response.json();
    pokemon = data.results.map((pokemon: { name: string }, index: number) => ({ id: index + 1, name: pokemon.name })).slice(0, MAX_DEX_NO);

    console.log('Pokemon fetched:', pokemon.length);
  }

  // get random 33 pokemon
  const randomPokemon = [...pokemon].sort(() => Math.random() - 0.5).slice(0, 30);
  // const last50Pokemon = pokemon.slice(-50);
  // console.log(pokemon)
  return json({ pokemon: randomPokemon });
}