"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/router";

export default function SignUp() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const router = useRouter();
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      axios
        .post(`${URL}/auth/register`, { username, email, password })
        .then((res) => {
          const token = res.data.token;
          // Store token in localStorage or sessionStorage
          localStorage.setItem("authToken", token); // or sessionStorage.setItem("authToken", token);
          // Set token in axios headers for future requests
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          //@ts-ignore
          router.push({
            pathname: "/dashboard",
          });
        });
    } catch (error) {
      console.error(error);
    }

    console.log("Sign up with:", username, email, password);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-100">Sign Up</CardTitle>
          <CardDescription className="text-gray-400">
            Create a new account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="text-sm font-medium text-gray-300"
              >
                Username
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-gray-700 text-gray-100 border-gray-600"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-300"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-gray-700 text-gray-100 border-gray-600"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-300"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-gray-700 text-gray-100 border-gray-600"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Sign Up
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Link
              href="/login"
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              Already have an account? Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
