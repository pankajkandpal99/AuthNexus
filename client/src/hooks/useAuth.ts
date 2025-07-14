import { useAppSelector } from "./redux";

export const useAuth = () => {
  const { loading, authenticated, initialized } = useAppSelector(
    (state) => state.auth
  );
  const { currentUser } = useAppSelector((state) => state.user);

  return { loading, authenticated, initialized, currentUser };
};
