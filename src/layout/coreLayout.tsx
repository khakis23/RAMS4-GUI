import React from 'react';

export const CoreLayout = ({ children }) => {
    return (
        <div
            className="flex h-screen w-screen bg-mauve-100 text-mauve-800 overflow-hidden py-4">

            <div
                className="flex h-full w-full bg-mauve-100 p-4 gap-4 relative">
                <div className="w-12 h-full shrink-0"></div>
                <aside
                    className="absolute left-4 top-4 bottom-4 w-12 bg-mauve-400 rounded-4xl flex flex-col items-center py-6 gap-4 z-50 transition-all duration-300 ease-in-out hover:w-64">
                    Menu items
                </aside>

                <main className="flex-1 p-6">
                    <h2>Hello</h2>
                </main>

            </div>
        </div>
    )
}