import { screen, render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
//for caching
import { SWRConfig } from "swr";
import { createServer } from "../../test/server";
import AuthButtons from "./AuthButtons";

async function renderComponent() {
  render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <MemoryRouter>
        <AuthButtons />
      </MemoryRouter>
    </SWRConfig>
  );
  await screen.findAllByRole("link");
}

// GET '/api/user' --> res {user:null}
//describe let us nest test
describe("when user is not signed in,", () => {
  createServer([
    {
      path: "/api/user",
      res: () => {
        return { user: null };
      },
    },
  ]);

  test(" both sign in and sign up are visible", async () => {
    await renderComponent();
    const signInButton = screen.getByRole("link", { name: /sign in/i });
    const signUpButton = screen.getByRole("link", { name: /sign up/i });

    expect(signInButton).toBeInTheDocument();
    expect(signInButton).toHaveAttribute("href", "/signin");

    expect(signUpButton).toBeInTheDocument();
    expect(signUpButton).toHaveAttribute("href", "/signup");
  });

  test(" sign out is not visible", async () => {
    await renderComponent();

    const signOutButton = screen.queryByRole("link", { name: /sign out/i });

    expect(signOutButton).not.toBeInTheDocument();
  });
});

// GET '/api/user' --> res {user: {id:3,email:'asdf@a.com'}}
//.only to run only this test
describe("when user is  signed in,", () => {
  createServer([
    {
      path: "/api/user",
      res: () => {
        return { user: { id: 3, email: "asdf@asdf.com" } };
      },
    },
  ]);

  test(" sign in and sign up buttons are not visible", async () => {
    await renderComponent();

    const signUpButton = screen.queryByRole("link", { name: /sign up/i });
    const signInButton = screen.queryByRole("link", { name: /sign in/i });

    expect(signUpButton).not.toBeInTheDocument();
    expect(signInButton).not.toBeInTheDocument();
  });

  test("sign out is visible", async () => {
    await renderComponent();

    const signOutButton = screen.getByRole("link", { name: /sign out/i });

    expect(signOutButton).toBeInTheDocument();
    expect(signOutButton).toHaveAttribute("href", "/signout");
  });
});
