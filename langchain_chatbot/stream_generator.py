import json
from langchain_core.messages import HumanMessage, ToolMessage

async def event_generator(agent, messages, thread_id):
        
    async for event in agent.astream_events(
        {"messages": [HumanMessage(content=messages)]}, 
        config={"configurable": {"thread_id": thread_id}},
        version="v2",
    ):
        kind = event["event"]

        if kind == "on_prompt_end":
            # console.print(f"[DEBUG]:ON_CHAT_MODEL_START -----{event['data']}\n\n")
            print("[INFO] ⚡ Agent is thinking...")
            print("================================================ \n")
            yield f"data: {json.dumps({'type': 'thinking', 'content': 'Agent is thinking...'})}\n\n"

        # tool call
        if kind == "on_tool_start":
            print("[INFO] Agent is calling a tool...")
            print("================================================ \n")
            yield f"data: {json.dumps({'type': 'tool_start', 'content': 'Agent is calling a tool...'})}\n\n"
            print(f"[DEBUG]:ON_TOOL_START -----{event['data']['input']}\n")
            # yield f"data: {json.dumps({'type': 'tool_start', 'content': event['data']['input']})}\n\n"
        if kind == "on_tool_end":
            tool_name = event["name"]
            tool_output = event["data"]["output"]

            if isinstance(tool_output, ToolMessage):
                tool_output = tool_output.content
            else:
                tool_output = str(tool_output)

            print(f"[INFO] Agent is done calling {tool_name}...")
            print("================================================ \n")
            yield f"data: {json.dumps({'type': 'tool_end', 'content': 'Agent has finished calling the tool.'})}\n\n"
            print(f"[DEBUG]:ON_TOOL_END -----{tool_output}\n\n")
            yield f"data: {json.dumps({'type': 'tool_end', 'content': tool_output})}\n\n"

        # stream of the output
        if kind == "on_chat_model_stream":
            content = event["data"]["chunk"].content
            print(content, flush=True, end="")

            yield f"data: {json.dumps({'type': 'stream', 'content': content})}\n\n"
