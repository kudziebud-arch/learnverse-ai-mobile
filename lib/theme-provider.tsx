import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance, View, useColorScheme as useSystemColorScheme } from "react-native";
import { colorScheme as nativewindColorScheme, vars } from "nativewind";

import { SchemeColors, type ColorScheme } from "@/constants/theme";

type ThemeContextValue = {
  colorScheme: ColorScheme;
  themePreference: ThemePreference;
  setColorScheme: (scheme: ColorScheme) => void;
  setThemePreference: (preference: ThemePreference) => void;
};

export type ThemePreference = ColorScheme | "system";
const THEME_PREFERENCE_KEY = "learnverse:theme-preference:v1";

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemColorScheme() ?? "light";
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>("system");
  const [latestSystemScheme, setLatestSystemScheme] = useState<ColorScheme>(systemScheme);
  const colorScheme = themePreference === "system" ? latestSystemScheme : themePreference;

  const applyScheme = useCallback((scheme: ColorScheme, preference: ThemePreference) => {
    nativewindColorScheme.set(scheme);
    Appearance.setColorScheme?.(preference === "system" ? null : scheme);
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.dataset.theme = scheme;
      root.classList.toggle("dark", scheme === "dark");
      const palette = SchemeColors[scheme];
      Object.entries(palette).forEach(([token, value]) => {
        root.style.setProperty(`--color-${token}`, value);
      });
    }
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(THEME_PREFERENCE_KEY).then((stored) => {
      if (stored === "light" || stored === "dark" || stored === "system") setThemePreferenceState(stored);
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme: nextScheme }) => setLatestSystemScheme(nextScheme ?? "light"));
    return () => subscription.remove();
  }, []);

  const setThemePreference = useCallback((preference: ThemePreference) => {
    setThemePreferenceState(preference);
    AsyncStorage.setItem(THEME_PREFERENCE_KEY, preference).catch(() => undefined);
  }, []);

  const setColorScheme = useCallback((scheme: ColorScheme) => setThemePreference(scheme), [setThemePreference]);

  useEffect(() => {
    applyScheme(colorScheme, themePreference);
  }, [applyScheme, colorScheme, themePreference]);

  const themeVariables = useMemo(
    () =>
      vars({
        "color-primary": SchemeColors[colorScheme].primary,
        "color-background": SchemeColors[colorScheme].background,
        "color-surface": SchemeColors[colorScheme].surface,
        "color-foreground": SchemeColors[colorScheme].foreground,
        "color-muted": SchemeColors[colorScheme].muted,
        "color-border": SchemeColors[colorScheme].border,
        "color-success": SchemeColors[colorScheme].success,
        "color-warning": SchemeColors[colorScheme].warning,
        "color-error": SchemeColors[colorScheme].error,
      }),
    [colorScheme],
  );

  const value = useMemo(
    () => ({
      colorScheme,
      themePreference,
      setColorScheme,
      setThemePreference,
    }),
    [colorScheme, setColorScheme, setThemePreference, themePreference],
  );

  return (
    <ThemeContext.Provider value={value}>
      <View style={[{ flex: 1 }, themeVariables]}>{children}</View>
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useThemeContext must be used within ThemeProvider");
  }
  return ctx;
}
