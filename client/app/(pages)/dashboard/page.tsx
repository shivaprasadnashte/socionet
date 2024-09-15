'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UserPlus, UserMinus, UserCheck } from "lucide-react"

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Searching for:', searchQuery)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <header className="bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex space-x-2">
            <Input 
              placeholder="Search users..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow bg-gray-700 text-gray-100 border-gray-600"
            />
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Search</Button>
          </form>
        </div>
        
        <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6">
          <div className="w-full lg:w-2/3 space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-100">Your Friends</CardTitle>
                <CardDescription className="text-gray-400">People you're connected with</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[...Array(12)].map((_, index) => (
                      <Card key={index} className="bg-gray-700 border-gray-600">
                        <CardContent className="flex items-center space-x-4 p-4">
                          <div className="w-12 h-12 rounded-full bg-gray-600"></div>
                          <div>
                            <h3 className="text-lg font-semibold">Friend {index + 1}</h3>
                            <p className="text-sm text-gray-400">friend{index + 1}@example.com</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-100">Suggested Friends</CardTitle>
                <CardDescription className="text-gray-400">People you may know</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-4">
                    {[...Array(8)].map((_, index) => (
                      <Card key={index} className="bg-gray-700 border-gray-600">
                        <CardContent className="flex items-center justify-between p-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-full bg-gray-600"></div>
                            <div>
                              <h3 className="font-semibold">Suggested User {index + 1}</h3>
                              <p className="text-sm text-gray-400">5 mutual friends</p>
                            </div>
                          </div>
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
          
          <div className="w-full lg:w-1/3">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-100">Friend Requests</CardTitle>
                <CardDescription className="text-gray-400">Pending connections</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <Card key={index} className="bg-gray-700 border-gray-600">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-12 h-12 rounded-full bg-gray-600"></div>
                          <div>
                            <h3 className="font-semibold">User {index + 1}</h3>
                            <p className="text-sm text-gray-400">3 mutual friends</p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                          <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                            <UserCheck className="mr-2 h-4 w-4" />
                            Accept
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1 border-red-600 text-red-600 hover:bg-red-600 hover:text-white">
                            <UserMinus className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}