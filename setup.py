from setuptools import setup, find_packages

setup(
    name="livestock_mcp_agent",  # The name you'll use for 'pip install'
    version="0.1.0",
    packages=find_packages(), # Automatically finds your package folders with __init__.py
    install_requires=[
        # Add external dependencies here, e.g., 'requests', 'numpy'
    ],
)
