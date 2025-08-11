"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Multiplayer Games Hub
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join friends in real-time multiplayer games. Choose your adventure
            below!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Rock Paper Scissors Game */}
          <Link href="/rps" className="group">
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group-hover:scale-105">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6">
                <div className="text-4xl mb-2">✂️🪨📄</div>
                <h2 className="text-2xl font-bold text-white">
                  Rock Paper Scissors
                </h2>
                <p className="text-purple-100">Classic game with 15 options!</p>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  Battle it out in the ultimate rock-paper-scissors showdown
                  with extended rules and new choices.
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    <span className="inline-block bg-gray-100 px-2 py-1 rounded mr-2">
                      2 Players
                    </span>
                    <span className="inline-block bg-gray-100 px-2 py-1 rounded">
                      Quick Game
                    </span>
                  </div>
                  <div className="bg-purple-500 text-white px-4 py-2 rounded-lg group-hover:bg-purple-600 transition-colors">
                    Play Now →
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* How to Play Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            How to Get Started
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎮</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Choose a Game</h3>
              <p className="text-gray-600 text-sm">
                Pick between Rock Paper Scissors or Maze Race
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔗</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Create or Join Room
              </h3>
              <p className="text-gray-600 text-sm">
                Enter a room code to join friends or create a new game
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Play & Win</h3>
              <p className="text-gray-600 text-sm">
                Compete in real-time with friends and claim victory!
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500">
          <p>
            Built with Next.js, React, and Ably for real-time multiplayer gaming
          </p>
        </div>
      </div>
    </main>
  );
}
