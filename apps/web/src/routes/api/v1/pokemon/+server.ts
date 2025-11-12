import { POKEAPI_URL } from "$env/static/private";
import { json } from "@sveltejs/kit";

export const GET = async ({ params }) => {
  const { id } = params;
  const response = await fetch(`${POKEAPI_URL}/pokemon?limit=-1`);
  const data = await response.json();
  return json(data.results);
}