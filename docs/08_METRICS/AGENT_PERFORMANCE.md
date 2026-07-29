# Agent Performance Metrics

**Part of AKES v1.5 — AI_MEMORY**
**Purpose:** Track, compare and improve agent execution across releases.

---

## Release Classification

| Type | Label | Wall-Clock | Tool Metrics | Use |
|------|-------|------------|--------------|-----|
| Process Baseline | `process_baseline` | Estimated only | Not captured | First release of a new process |
| Performance Baseline | `performance_baseline` | From first command | Captured | First measured release |
| Measured | `measured` | Full | Full | All subsequent releases |

---

## Metrics Schema

### Timing

| Metric | Type | Description | Required |
|--------|------|-------------|----------|
| `run_started_at` | ISO 8601 | When the first command or analysis began | ✅ |
| `run_completed_at` | ISO 8601 | When the last commit or deploy finished | ✅ |
| `total_wall_clock_ms` | integer | `run_completed_at - run_started_at` in ms | ✅ |
| `planning_duration_ms` | integer | Analysis, context gathering, decision making | 🔷 |
| `implementation_duration_ms` | integer | Code writing, file editing | 🔷 |
| `build_duration_ms` | integer | Build, typecheck, lint | 🔷 |
| `test_duration_ms` | integer | Automated test execution | 🔷 |
| `deployment_duration_ms` | integer | Deploy commands + wait time | 🔷 |
| `qa_duration_ms` | integer | QA verification after deploy | 🔷 |
| `cleanup_duration_ms` | integer | Demo content cleanup, rollback | 🔷 |
| `tool_wait_duration_ms` | integer | Time spent waiting for tool responses | 🔷 |
| `active_execution_duration_ms` | integer | `total - tool_wait` — true agent working time | 🔷 |

🔷 = Recommended but not always measurable per-tool.

### Commands and Tools

| Metric | Type | Description |
|--------|------|-------------|
| `tool_calls_total` | integer | All tool invocations |
| `tool_calls_successful` | integer | Tools that returned without error |
| `tool_calls_failed` | integer | Tools that errored or timed out |
| `retry_count` | integer | Failed tools that were retried |
| `commands_executed` | integer | Bash commands run |

### Code and Delivery

| Metric | Type | Description |
|--------|------|-------------|
| `files_changed` | integer | Files created + modified (code + docs) |
| `lines_added` | integer | Total lines added (all repos) |
| `lines_removed` | integer | Total lines removed (all repos) |
| `commits_created` | integer | Commits across all repos |
| `database_operations` | integer | Migrations, seeds, data operations |
| `deployments_attempted` | integer | Deploy commands issued |
| `deployments_successful` | integer | Successful deploys |
| `automated_tests_total` | integer | Test cases executed |
| `automated_tests_passed` | integer | Passing test cases |
| `manual_tests_total` | integer | Manual test scenarios identified |
| `manual_tests_deferred` | integer | Manual tests intentionally skipped |

### Decision Efficiency

| Metric | Type | Description |
|--------|------|-------------|
| `planning_iterations` | integer | Times the plan was revised before approval |
| `implementation_revisions` | integer | Times code was rewritten or significantly changed |
| `architecture_revisions` | integer | Architecture decisions reversed or changed |
| `review_cycles` | integer | Number of user review cycles |
| `approval_cycles` | integer | Number of approval requests |

---

## Derived Formulas

### Total Lead Time
```
total_wall_clock_ms = run_completed_at - run_started_at
```
The entire duration from first action to session close. Includes idle/wait time.

### Active Execution Time
```
active_execution_duration_ms = planning_duration_ms
                              + implementation_duration_ms
                              + active_tool_execution_ms
```
Excludes build, deploy, and network wait time when the agent is idle.

### Command Throughput
```
command_throughput = successful_commands / active_execution_minutes
```
Commands per minute of active work. Higher is generally better, but complex tasks may have lower throughput.

### Tool Success Rate
```
tool_success_rate = successful_tool_calls / total_tool_calls
```
Reliability of tool execution. Target: >95%.

### Retry Rate
```
retry_rate = retries / total_tool_calls
```
How often tools fail and need retry. Target: <5%.

### First-Pass Success Rate
```
first_pass_success_rate = steps_completed_without_correction / total_implementation_steps
```
How often the agent gets it right the first time. Target: >80%.

### Review Efficiency
```
review_efficiency = accepted_deliverables / review_cycles
```
How many deliverables pass per review cycle. Target: >2.

---

## Release Records

| Release | Type | Wall-Clock | Tests | Files Changed | Tool Success | Notes |
|---------|------|------------|-------|---------------|--------------|-------|
| 2026-07-29 | `process_baseline` | ~11.5h (est.) | 47/47 | 45+ (combined) | Not measured | First documented lifecycle |
| — | — | — | — | — | — | — |
