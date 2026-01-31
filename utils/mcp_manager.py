import os
import sys
import json
import asyncio
from rich import print
from langchain_mcp_adapters.client import MultiServerMCPClient

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))


async def generate_mcp_config_file(config_json: str):
    print(f"Loading MCP config from {config_json}")
    with open(config_json, "r") as f:
        config = json.load(f)

    mcp_config = {}

    for server_name, server_info in config["mcpServers"].items():
        if server_info.get("disabled", False):
            continue

        if "url" in server_info:
            # HTTP-based MCP server
            mcp_config[server_name] = {
                "url": server_info["url"],
                "transport": "streamable_http",  # streamable_http for HTTP servers
                "headers": server_info.get("headers", {}),
            }
        elif "command" in server_info and "args" in server_info:
            # Subprocess MCP server
            mcp_config[server_name] = {
                "command": server_info["command"],
                "args": server_info["args"],
                "transport": "stdio",  # stdio transport for subprocess
            }
            # Include environment variables if present
            if "env" in server_info:
                mcp_config[server_name]["env"] = server_info["env"]

    return mcp_config


async def create_mcp_client(config_file: str):
    print(f"Loading MCP config from {config_file}")
    with open(config_file, "r") as f:
        config = json.load(f)

    mcp_config = {}

    for server_name, server_info in config["mcpServers"].items():
        if server_info.get("disabled", False):
            continue

        if "url" in server_info:
            # HTTP-based MCP server
            mcp_config[server_name] = {
                "url": server_info["url"],
                "transport": "streamable_http",  # streamable_http for HTTP servers
                "headers": server_info.get("headers", {}),
            }
        elif "command" in server_info and "args" in server_info:
            # Subprocess MCP server
            mcp_config[server_name] = {
                "command": server_info["command"],
                "args": server_info["args"],
                "transport": "stdio",  # stdio transport for subprocess
            }
            # Include environment variables if present
            if "env" in server_info:
                mcp_config[server_name]["env"] = server_info["env"]

    # Create the client with all servers
    client = MultiServerMCPClient(mcp_config)
    print(mcp_config)

    return client


async def load_tools_for_server(name, cfg):
    """Helper to load tools for a single server safely."""
    try:
        client = MultiServerMCPClient({name: cfg})
        tools = await client.get_tools()
        print(f"✅ Loaded {len(tools)} tools from {name}")
        return tools
    except Exception as e:
        print(f"❌ Failed to load tools from {name}: {e}")
        return []


async def get_mcp_tools_from_config(config_file: str):
    """Loads MCP tools from all servers concurrently."""
    config = await generate_mcp_config_file(config_file)
    results = await asyncio.gather(
        *(load_tools_for_server(name, cfg) for name, cfg in config.items()),
        return_exceptions=False,
    )
    # Flatten all tool lists into one
    return [tool for sublist in results for tool in sublist]




if __name__ == "__main__":
    tools = asyncio.run(get_mcp_tools_from_config("config.json"))

    print(tools)
