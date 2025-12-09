export const TOOLS = [
  {
    type: "function",
    function: {
      name: "invert_matrix",
      description: "Invert a square matrix given as a list of lists.",
      parameters: {
        type: "object",
        properties: { matrix: { type: "array", items: { type: "array", items: { type: "number" } } } },
        required: ["matrix"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "solve_hanoi",
      description: "Solve the Towers of Hanoi puzzle for N disks.",
      parameters: {
        type: "object",
        properties: { n: { type: "integer", description: "Number of disks" } },
        required: ["n"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "search_internet",
      description: "Search the internet for real-time information.",
      parameters: {
        type: "object",
        properties: { query: { type: "string", description: "Search query" } },
        required: ["query"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_local_time",
      description: "Get the current system date and time (server local time).",
      parameters: { type: "object", properties: {} }
    }
  },
  {
    type: "function",
    function: {
      name: "get_city_time",
      description: "Get the current date and time for a specific city.",
      parameters: {
        type: "object",
        properties: {
          city: { type: "string", description: "The name of the city (e.g., 'Tokyo', 'New York')." }
        },
        required: ["city"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_weather",
      description: "Get current weather for a specific city using Open-Meteo.",
      parameters: {
        type: "object",
        properties: {
          city: { type: "string", description: "The name of the city to get weather for." }
        },
        required: ["city"]
      }
    }
  }
];