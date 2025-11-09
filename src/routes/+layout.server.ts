export const load = async ({ cookies }) => {
  // get userId from cookies
  // if not found, generate a uuid and set it in cookies
  // return the userId
  const userId = cookies.get('userId');
  if (!userId) {
    const newUserId = crypto.randomUUID();
    cookies.set('userId', newUserId, { path: '/' });
    return { userId: newUserId };
  }
  return { userId };
};