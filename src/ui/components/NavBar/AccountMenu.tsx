"use client";

import {
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import { UserIcon } from "@heroicons/react/24/outline";

type DemoProfile = {
  name: string;
  phone: string;
};

const PROFILE_STORAGE_KEY = "lyns-demo-profile";
let profileSnapshot: DemoProfile | null = null;
let hasReadProfile = false;
const profileListeners = new Set<() => void>();

function isDemoProfile(value: unknown): value is DemoProfile {
  if (typeof value !== "object" || value === null) return false;
  return (
    "name" in value &&
    typeof value.name === "string" &&
    "phone" in value &&
    typeof value.phone === "string"
  );
}

function getProfileSnapshot() {
  if (!hasReadProfile && typeof window !== "undefined") {
    profileSnapshot = null;
    try {
      const savedProfile = window.localStorage.getItem(PROFILE_STORAGE_KEY);
      if (savedProfile) {
        const parsed: unknown = JSON.parse(savedProfile);
        if (isDemoProfile(parsed)) {
          profileSnapshot = parsed;
        } else {
          console.error("Saved demo profile has an invalid format.");
        }
      }
    } catch (error) {
      console.error("Unable to load the saved demo profile.", error);
    }
    hasReadProfile = true;
  }
  return profileSnapshot;
}

function notifyProfileListeners() {
  profileListeners.forEach((listener) => listener());
}

function handleProfileStorageChange(event: StorageEvent) {
  if (event.key !== PROFILE_STORAGE_KEY && event.key !== null) return;
  hasReadProfile = false;
  profileSnapshot = getProfileSnapshot();
  notifyProfileListeners();
}

function subscribeToProfile(listener: () => void) {
  profileListeners.add(listener);
  if (profileListeners.size === 1 && typeof window !== "undefined") {
    window.addEventListener("storage", handleProfileStorageChange);
  }
  return () => {
    profileListeners.delete(listener);
    if (profileListeners.size === 0 && typeof window !== "undefined") {
      window.removeEventListener("storage", handleProfileStorageChange);
    }
  };
}

export default function AccountMenu() {
  const profile = useSyncExternalStore(
    subscribeToProfile,
    getProfileSnapshot,
    () => null,
  );
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextProfile = { name: name.trim(), phone: phone.trim() };
    if (!nextProfile.name || !nextProfile.phone) {
      setError("Enter your name and mobile number.");
      return;
    }

    try {
      window.localStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify(nextProfile),
      );
      profileSnapshot = nextProfile;
      hasReadProfile = true;
      notifyProfileListeners();
      setIsSigningIn(false);
      setError("");
    } catch (profileError) {
      console.error("Unable to save the demo profile.", profileError);
      setError("Could not save your profile in this browser.");
    }
  }

  function signOut() {
    try {
      window.localStorage.removeItem(PROFILE_STORAGE_KEY);
      profileSnapshot = null;
      hasReadProfile = true;
      notifyProfileListeners();
      setName("");
      setPhone("");
      setIsSigningIn(false);
      setError("");
    } catch (profileError) {
      console.error("Unable to remove the demo profile.", profileError);
      setError("Could not sign out in this browser.");
    }
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onFocus={() => setIsOpen(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsOpen(false);
        }
      }}
    >
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 transition-colors hover:text-[#935F4C]"
      >
        <UserIcon className="h-5 w-5 text-gray-600" />
        <span>{profile ? profile.name.split(" ")[0] : "Sign In"}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-40 mt-2 w-72 rounded-lg border border-[#EFECE6] bg-white p-4 text-left shadow-xl">
          {profile && !isSigningIn ? (
            <>
              <p className="font-semibold text-[#262524]">{profile.name}</p>
              <p className="mt-1 text-sm text-gray-600">{profile.phone}</p>
              <p className="mt-3 rounded bg-[#F7F4F0] p-2 text-xs leading-relaxed text-gray-500">
                Demo profile saved on this device. This is not a secure account
                sign-in.
              </p>
              <button
                type="button"
                onClick={signOut}
                className="mt-3 w-full rounded border border-[#EFECE6] px-3 py-2 text-sm font-medium text-[#935F4C] hover:bg-[#F7F4F0]"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <h2 className="font-semibold text-[#262524]">
                {isSigningIn ? "Demo sign in" : "Your account"}
              </h2>
              {isSigningIn ? (
                <form onSubmit={signIn} className="mt-3 flex flex-col gap-3">
                  <label className="flex flex-col gap-1 text-sm">
                    <span>Name</span>
                    <input
                      autoComplete="name"
                      required
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className="rounded border border-[#EFECE6] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#935F4C]"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm">
                    <span>Mobile number</span>
                    <input
                      autoComplete="tel"
                      type="tel"
                      required
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="+237..."
                      className="rounded border border-[#EFECE6] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#935F4C]"
                    />
                  </label>
                  {error && (
                    <p role="alert" className="text-sm text-red-700">
                      {error}
                    </p>
                  )}
                  <button
                    type="submit"
                    className="rounded bg-[#935F4C] px-3 py-2 text-sm font-medium text-white hover:bg-[#7A4E3E]"
                  >
                    Sign in on this device
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSigningIn(false);
                      setError("");
                    }}
                    className="text-sm text-[#935F4C] underline underline-offset-2"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <>
                  <p className="mt-1 text-sm text-gray-600">
                    Create a temporary profile on this device with your name
                    and mobile number.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setName(profile?.name ?? "");
                      setPhone(profile?.phone ?? "");
                      setIsSigningIn(true);
                    }}
                    className="mt-3 w-full rounded bg-[#935F4C] px-3 py-2 text-sm font-medium text-white hover:bg-[#7A4E3E]"
                  >
                    Sign in
                  </button>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
