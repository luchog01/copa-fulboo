import { test, expect } from "@playwright/test";

test.describe("Copa Fulboo", () => {
  test("homepage shows recent matches and top players", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Copa Fulboo/i })).toBeVisible();
    await expect(page.getByText("Últimos partidos")).toBeVisible();
    await expect(page.getByText("Top jugadores")).toBeVisible();
    // seed data should show at least one match
    await expect(page.getByText(/5v5|8v8/).first()).toBeVisible();
  });

  test("jugadores page shows stats table", async ({ page }) => {
    await page.goto("/jugadores");
    await expect(page.getByRole("heading", { name: "Jugadores" })).toBeVisible();
    // table headers
    await expect(page.getByText("PJ")).toBeVisible();
    await expect(page.getByText("% Vic")).toBeVisible();
    // seed players
    await expect(page.getByText("Luciano")).toBeVisible();
  });

  test("partidos page shows match list", async ({ page }) => {
    await page.goto("/partidos");
    await expect(page.getByRole("heading", { name: "Partidos" })).toBeVisible();
    await expect(page.getByText(/partidos registrados/)).toBeVisible();
  });

  test("match detail shows scoreboard and players", async ({ page }) => {
    await page.goto("/partidos/1");
    // score visible
    await expect(page.getByText("4", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("2", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Local").first()).toBeVisible();
    await expect(page.getByText("Visitante").first()).toBeVisible();
    await expect(page.getByText(/MVP/)).toBeVisible();
  });

  test("admin login flow", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Acceso Admin")).toBeVisible();

    await page.getByPlaceholder("Contraseña").fill("fulboo123");
    await page.getByRole("button", { name: "Ingresar" }).click();

    // after login redirect to home, navbar shows "+ Partido"
    await page.waitForURL("/");
    await expect(page.getByText("+ Partido")).toBeVisible();
  });

  test("crear partido completo flujo", async ({ page }) => {
    // login first
    await page.goto("/login");
    await page.getByPlaceholder("Contraseña").fill("fulboo123");
    await page.getByRole("button", { name: "Ingresar" }).click();
    await page.waitForURL("/");

    // navigate to new match
    await page.goto("/partidos/nuevo");
    await expect(page.getByRole("heading", { name: "Nuevo partido" })).toBeVisible();

    // set scores
    await page.locator("#homeScore").fill("3");
    await page.locator("#awayScore").fill("1");

    // select home players: first two toggle buttons in the Local card
    const homeButtons = page.locator("text=Local (").locator("..").locator("..").getByRole("button");
    await homeButtons.nth(0).click(); // Luci
    await homeButtons.nth(1).click(); // Mati

    // select away players: first two toggle buttons in the Visitante card
    const awayButtons = page.locator("text=Visitante (").locator("..").locator("..").getByRole("button");
    await awayButtons.nth(2).click(); // Fede (Luci/Mati already taken by home)
    await awayButtons.nth(3).click(); // Santi

    // submit
    await page.getByRole("button", { name: "Guardar partido" }).click();

    // should redirect to the new match detail
    await page.waitForURL(/\/partidos\/\d+/, { timeout: 10000 });
    await expect(page.getByText("3", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("1", { exact: true }).first()).toBeVisible();
  });
});
