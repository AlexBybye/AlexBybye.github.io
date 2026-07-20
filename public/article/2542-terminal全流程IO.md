---
title: Text-to-SQL 全流程 IO 拆解：生成与守护 Agent
date: 2026-06-15
category: AI
tags:
  - AI
  - Text-to-SQL
  - 项目
description: 生成 Agent 12 子阶段与守护 Agent 4 子阶段的端到端执行追踪
---
## Detailed Analysis of Generation Agent Sub-Stages

### Generation Agent.1: Analysis of Collective Logical Intent

**Intermediate Output 2542.1: Set Logic Analysis**

JSON

```
{
  "question": "What are the names of all European countries with at least 3 manufacturers?",
  "set_logic_analysis": {
    "has_negation": false,
    "has_intersect": false,
    "has_having_count": true,
    "having_n": 3,
    "hints": [
      "AGGREGATION DETECTED: Use 'GROUP BY' on the entity identifier and 'HAVING COUNT(...) >= 3' to filter groups based on the manufacturer threshold."
    ],
    "detected_patterns": ["at least 3"],
    "recommended_sql_patterns": ["GROUP BY ... HAVING COUNT(*) >= 3"]
  }
}
```

### Generation Agent.2: Column Synonym Analysis

**Intermediate Output 2542.2: Column Synonym Analysis**

JSON

```
{
  "column_descriptions": {
    "countries": {
      "CountryId": {
        "tags": ["ID", "PRIMARY KEY"],
        "description": "Unique identifier for the country",
        "sample_values": [1, 2, 3, 4]
      },
      "CountryName": {
        "tags": ["NAME"],
        "description": "Name of the country",
        "sample_values": ["USA", "Germany", "France"]
      },
      "Continent": {
        "tags": ["FOREIGN KEY"],
        "description": "Foreign key pointing to continents table",
        "sample_values": [1, 2, 3]
      }
    },
    "continents": {
      "ContId": {
        "tags": ["ID", "PRIMARY KEY"],
        "description": "Unique identifier for the continent",
        "sample_values": [1, 2, 3]
      },
      "Continent": {
        "tags": ["NAME", "STRING"],
        "description": "Name of the continent",
        "sample_values": ["America", "Europe", "Asia"]
      }
    },
    "car_makers": {
      "Id": {
        "tags": ["ID", "PRIMARY KEY"],
        "description": "Unique identifier for the manufacturer",
        "sample_values": [1, 2, 3]
      },
      "Maker": {
        "tags": ["STRING"],
        "description": "Name of the car maker",
        "sample_values": ["Ford", "Volkswagen", "Fiat"]
      },
      "Country": {
        "tags": ["FOREIGN KEY"],
        "description": "Foreign key pointing to countries table",
        "sample_values": [1, 2, 3]
      }
    }
  },
  "value_evidence": {
    "European": {
      "found_in": ["continents.Continent"],
      "confidence": 1.0,
      "mapped_value": "europe"
    }
  }
}
```

### Generation Agent.3: KBE Knowledge Base Injection

**Intermediate Output 2542.3: KBE Knowledge Base Injection**

JSON

```
{
  "kbe_entry": {
    "db_id": "car_1",
    "db_context": "Database containing information about continents, countries, car makers, models, and technical specifications.",
    "columns": {
      "continents.Continent": "The name of the continent (e.g., 'europe', 'america'). Always match in lowercase or use case-insensitive comparison.",
      "countries.CountryName": "The official name of the country.",
      "car_makers.Country": "Links a manufacturer to its origin country via countries.CountryId.",
      "countries.Continent": "Links a country to its continent via continents.ContId."
    }
  }
}
```

### Generation Agent.4: Multi-Prompt Generation

**Intermediate Output 2542.4.1: Vanilla Prompt**

JSON

```
{
  "name": "vanilla",
  "prompt_length": 1420,
  "has_kbe": true,
  "has_set_logic_hints": false,
  "has_column_descriptions": false,
  "has_value_evidence": false,
  "config": {
    "n": 5,
    "temp": 0.8,
    "top_p": 0.95
  }
}
```

**Intermediate Output 2542.4.2: Set Logic Prompt**

JSON

```
{
  "name": "set_logic",
  "prompt_length": 1680,
  "has_kbe": true,
  "has_set_logic_hints": true,
  "has_column_descriptions": false,
  "has_value_evidence": false,
  "config": {
    "n": 4,
    "temp": 1.0,
    "top_p": 0.95
  }
}
```

**Intermediate Output 2542.4.3: Column Synonym Prompt**

JSON

```
{
  "name": "column_synonym",
  "prompt_length": 1950,
  "has_kbe": true,
  "has_set_logic_hints": false,
  "has_column_descriptions": true,
  "has_value_evidence": true,
  "config": {
    "n": 5,
    "temp": 0.9,
    "top_p": 0.95
  }
}
```

### Generation Agent.5: Generating Candidate SQL Statements

**Intermediate Output 2542.5: Raw Candidate SQL**

JSON

```
{
  "raw_candidates": [
    {
      "sql": "SELECT t1.countryname FROM countries AS t1 JOIN continents AS t2 ON t1.continent = t2.contid WHERE t2.continent = 'Europe' GROUP BY t1.countryid HAVING COUNT(t1.countryid) >= 3;",
      "source": "vanilla"
    },
    {
      "sql": "SELECT t1.CountryName FROM countries AS t1 JOIN continents AS t2 ON t1.Continent = t2.ContId JOIN car_makers AS t3 ON t3.Country = t1.CountryId WHERE t2.Continent = 'Europe' GROUP BY t1.CountryId HAVING COUNT(t3.Id) >= 3;",
      "source": "vanilla"
    },
    {
      "sql": "SELECT t1.countryname FROM countries AS t1 JOIN car_makers AS t2 ON t1.countryid = t2.country JOIN continents AS t3 ON t1.continent = t3.contid WHERE t3.continent = 'Europe' GROUP BY t1.countryid HAVING COUNT(*) >= 3;",
      "source": "set_logic"
    },
    {
      "sql": "SELECT t1.CountryName FROM countries t1 JOIN continents t2 ON t1.Continent = t2.ContId JOIN car_makers t3 ON t3.Country = t1.CountryId WHERE t2.Continent = 'europe' GROUP BY t1.CountryId HAVING COUNT(t3.Id) >= 3;",
      "source": "column_synonym"
    }
  ]
}
```

### Generation Agent.6: DB-Aware Post-Processing Correction

**Correction process for Candidate 1:**

JSON

```
{
  "original_sql": "SELECT t1.countryname FROM countries AS t1 JOIN continents AS t2 ON t1.continent = t2.contid WHERE t2.continent = 'Europe' GROUP BY t1.countryid HAVING COUNT(t1.countryid) >= 3;",
  "step1_where_fix": {
    "checked": true,
    "where_conditions": [
      {
        "column": "t2.continent",
        "operator": "=",
        "value": "Europe",
        "value_exists": true,
        "fix_needed": false
      }
    ],
    "fixes_applied": []
  },
  "step2_space_fix": {
    "checked": true,
    "string_values": ["Europe"],
    "has_trailing_spaces": false,
    "fixes_applied": []
  },
  "step3_column_fix": {
    "checked": true,
    "column_refs": [
      {"alias": "t1", "column": "countryname", "exists": true},
      {"alias": "t2", "column": "continent", "exists": true}
    ],
    "fixes_applied": []
  },
  "corrected_sql": "SELECT t1.countryname FROM countries AS t1 JOIN continents AS t2 ON t1.continent = t2.contid WHERE t2.continent = 'Europe' GROUP BY t1.countryid HAVING COUNT(t1.countryid) >= 3;",
  "total_fixes": 0
}
```

**Revision Process for Candidate 4 (from column_synonym):**

JSON

```
{
  "original_sql": "SELECT t1.CountryName FROM countries t1 JOIN continents t2 ON t1.Continent = t2.ContId JOIN car_makers t3 ON t3.Country = t1.CountryId WHERE t2.Continent = 'europe' GROUP BY t1.CountryId HAVING COUNT(t3.Id) >= 3;",
  "alias_map": {
    "t1": "countries",
    "t2": "continents",
    "t3": "car_makers"
  },
  "step1_where_fix": {
    "checked": true,
    "where_conditions": [
      {
        "resolved_table": "continents",
        "column": "Continent",
        "operator": "=",
        "value": "europe",
        "value_exists": true,
        "fix_needed": false
      }
    ],
    "fixes_applied": []
  },
  "step2_space_fix": {
    "checked": true,
    "fixes_applied": []
  },
  "step3_column_fix": {
    "checked": true,
    "column_refs": [
      {"alias": "t1", "real_table": "countries", "column": "CountryName", "exists": true},
      {"alias": "t2", "real_table": "continents", "column": "Continent", "exists": true},
      {"alias": "t3", "real_table": "car_makers", "column": "Id", "exists": true}
    ],
    "fixes_applied": []
  },
  "corrected_sql": "SELECT t1.CountryName FROM countries t1 JOIN continents t2 ON t1.Continent = t2.ContId JOIN car_makers t3 ON t3.Country = t1.CountryId WHERE t2.Continent = 'europe' GROUP BY t1.CountryId HAVING COUNT(t3.Id) >= 3;",
  "total_fixes": 0
}
```

**Intermediate Output 2542.7: post_correction_results.json**

JSON

```
{
  "candidate_0": {
    "original": "SELECT t1.countryname FROM countries AS t1 JOIN continents AS t2 ON t1.continent = t2.contid WHERE t2.continent = 'Europe' GROUP BY t1.countryid HAVING COUNT(t1.countryid) >= 3;",
    "corrected": "SELECT t1.countryname FROM countries AS t1 JOIN continents AS t2 ON t1.continent = t2.contid WHERE t2.continent = 'Europe' GROUP BY t1.countryid HAVING COUNT(t1.countryid) >= 3;",
    "fixes": [],
    "was_corrected": false
  },
  "candidate_3": {
    "original": "SELECT t1.CountryName FROM countries AS t1 JOIN continents AS t2 ON t1.Continent = t2.ContId JOIN car_makers AS t3 ON t3.Country = t1.CountryId WHERE t2.Continent = 'Europe' GROUP BY t1.CountryId HAVING COUNT(t3.Id) >= 3;",
    "corrected": "SELECT t1.CountryName FROM countries AS t1 JOIN continents AS t2 ON t1.Continent = t2.ContId JOIN car_makers AS t3 ON t3.Country = t1.CountryId WHERE t2.Continent = 'Europe' GROUP BY t1.CountryId HAVING COUNT(t3.Id) >= 3;",
    "fixes": [],
    "was_corrected": false
  },
  "candidate_10": {
    "original": "SELECT t1.CountryName FROM countries t1 JOIN continents t2 ON t1.Continent = t2.ContId JOIN car_makers t3 ON t3.Country = t1.CountryId WHERE t2.Continent = 'europe' GROUP BY t1.CountryId HAVING COUNT(t3.Id) >= 3;",
    "corrected": "SELECT t1.CountryName FROM countries t1 JOIN continents t2 ON t1.Continent = t2.ContId JOIN car_makers t3 ON t3.Country = t1.CountryId WHERE t2.Continent = 'europe' GROUP BY t1.CountryId HAVING COUNT(t3.Id) >= 3;",
    "fixes": [],
    "was_corrected": false
  }
}
```

### Generation Agent.7: Column Whitelist Filtering

Each candidate undergoes column existence validation against the schema whitelist:

**Database Schema Whitelist:**

JSON

```
{
  "continents": ["ContId", "Continent"],
  "countries": ["CountryId", "CountryName", "Continent"],
  "car_makers": ["Id", "Maker", "FullId", "Country"]
}
```

**Candidate 10 Validation:**

JSON

```
{
  "sql": "SELECT t1.CountryName FROM countries t1 JOIN continents t2 ON t1.Continent = t2.ContId JOIN car_makers t3 ON t3.Country = t1.CountryId WHERE t2.Continent = 'europe' GROUP BY t1.CountryId HAVING COUNT(t3.Id) >= 3;",
  "alias_resolution": {
    "t1": "countries",
    "t2": "continents",
    "t3": "car_makers"
  },
  "extracted_columns": [
    {"alias": "t1", "real_table": "countries", "column": "CountryName"},
    {"alias": "t1", "real_table": "countries", "column": "Continent"},
    {"alias": "t2", "real_table": "continents", "column": "ContId"},
    {"alias": "t2", "real_table": "continents", "column": "Continent"},
    {"alias": "t3", "real_table": "car_makers", "column": "Country"},
    {"alias": "t1", "real_table": "countries", "column": "CountryId"},
    {"alias": "t3", "real_table": "car_makers", "column": "Id"}
  ],
  "validation_results": [
    {"table": "countries", "column": "CountryName", "exists": true, "in_whitelist": true},
    {"table": "countries", "column": "Continent", "exists": true, "in_whitelist": true},
    {"table": "continents", "column": "ContId", "exists": true, "in_whitelist": true},
    {"table": "continents", "column": "Continent", "exists": true, "in_whitelist": true},
    {"table": "car_makers", "column": "Country", "exists": true, "in_whitelist": true},
    {"table": "countries", "column": "CountryId", "exists": true, "in_whitelist": true},
    {"table": "car_makers", "column": "Id", "exists": true, "in_whitelist": true}
  ],
  "invalid_columns": [],
  "col_score": 1.0,
  "valid": true
}
```

**Intermediate Output 2542.8: column_validation_results.json**

JSON

```
{
  "candidate_0": {"col_score": 1.0, "valid": true, "invalid_columns": []},
  "candidate_3": {"col_score": 1.0, "valid": true, "invalid_columns": []},
  "candidate_10": {"col_score": 1.0, "valid": true, "invalid_columns": []},
  "all_valid": true,
  "filtered_candidates": [0, 3, 10]
}
```

### Generation Agent.8: Sketch Constraint Scoring (Detailed Process)

Evaluating compliance scores based on structural requirements matching the programmatic intent:

**Sketch Structural Analysis:**

JSON

```
{
  "sketch": {
    "query_type": "SELECT",
    "select_clause": [{"item": {"type": "column", "table": "countries", "column": "CountryName"}}],
    "from_clause": {"tables": ["countries", "continents", "car_makers"], "join_path": []},
    "where_clause": {
      "conditions": [{
        "left": {"type": "column", "table": "continents", "column": "Continent"},
        "operator": "=",
        "right": {"type": "literal", "value": "europe"}
      }],
      "logic": "AND"
    },
    "group_by": [{"table": "countries", "column": "CountryId"}],
    "having": {
      "conditions": [{
        "left": {"type": "aggregation", "function": "COUNT", "column": "car_makers.Id"},
        "operator": ">=",
        "right": {"type": "literal", "value": 3}
      }]
    },
    "order_by": null,
    "limit": null
  },
  "required_tables": {"countries", "continents", "car_makers"},
  "required_columns": [
    {"table": "countries", "column": "CountryName"},
    {"table": "continents", "column": "Continent"},
    {"table": "car_makers", "column": "Id"}
  ],
  "required_structure": {
    "has_subquery": false,
    "has_not_in": false,
    "has_join": true,
    "has_group_by": true,
    "has_having": true
  }
}
```

**Candidate 10 Evaluation Score:**

JSON

```
{
  "sql": "SELECT t1.CountryName FROM countries t1 JOIN continents t2 ON t1.Continent = t2.ContId JOIN car_makers t3 ON t3.Country = t1.CountryId WHERE t2.Continent = 'europe' GROUP BY t1.CountryId HAVING COUNT(t3.Id) >= 3;",
  "table_compliance": {
    "sketch_tables": ["countries", "continents", "car_makers"],
    "sql_tables": ["countries", "continents", "car_makers"],
    "missing_tables": [],
    "extra_tables": [],
    "table_score": 1.0
  },
  "column_compliance": {
    "required_columns": [
      {"table": "countries", "column": "CountryName", "found": true},
      {"table": "continents", "column": "Continent", "found": true},
      {"table": "car_makers", "column": "Id", "found": true}
    ],
    "missing_columns": [],
    "column_score": 1.0
  },
  "structure_compliance": {
    "has_subquery": false,
    "has_not_in": false,
    "has_join": true,
    "has_group_by": true,
    "has_having": true,
    "structure_score": 1.0
  },
  "sketch_score": 1.0,
  "compliance": "full"
}
```

**Intermediate Output 2542.9: sketch_compliance_results.json**

JSON

```
{
  "candidate_0": {"sketch_score": 0.7, "compliance": "partial", "reason": "missing car_makers join table mapping"},
  "candidate_3": {"sketch_score": 1.0, "compliance": "full", "table_score": 1.0, "column_score": 1.0, "structure_score": 1.0},
  "candidate_10": {"sketch_score": 1.0, "compliance": "full", "table_score": 1.0, "column_score": 1.0, "structure_score": 1.0},
  "all_perfect": false
}
```

### Generation Agent.9: Execution Consistency Voting (Detailed Process)

**Executing SQL Candidates on Target DB:**

**Candidate 3 Execution Output:**

JSON

```
{
  "sql": "SELECT t1.CountryName FROM countries AS t1 JOIN continents AS t2 ON t1.Continent = t2.ContId JOIN car_makers AS t3 ON t3.Country = t1.CountryId WHERE t2.Continent = 'Europe' GROUP BY t1.CountryId HAVING COUNT(t3.Id) >= 3;",
  "execution": {
    "success": true,
    "error": null,
    "rows": [
      ["Germany"],
      ["France"],
      ["United Kingdom"],
      ["Italy"]
    ],
    "n_rows": 4,
    "n_cols": 1,
    "is_empty": false
  },
  "result_key": "[['Germany'], ['France'], ['United Kingdom'], ['Italy']]"
}
```

**Candidate 10 Execution Output:**

JSON

```
{
  "sql": "SELECT t1.CountryName FROM countries t1 JOIN continents t2 ON t1.Continent = t2.ContId JOIN car_makers t3 ON t3.Country = t1.CountryId WHERE t2.Continent = 'europe' GROUP BY t1.CountryId HAVING COUNT(t3.Id) >= 3;",
  "execution": {
    "success": true,
    "error": null,
    "rows": [
      ["Germany"],
      ["France"],
      ["United Kingdom"],
      ["Italy"]
    ],
    "n_rows": 4,
    "n_cols": 1,
    "is_empty": false
  },
  "result_key": "[['Germany'], ['France'], ['United Kingdom'], ['Italy']]"
}
```

**Consistency Voting Matrix:**

JSON

```
{
  "result_groups": {
    "[[\"Germany\"], [\"France\"], [\"United Kingdom\"], [\"Italy\"]]": [
      "SELECT t1.CountryName FROM countries AS t1 JOIN continents AS t2 ON t1.Continent = t2.ContId JOIN car_makers AS t3 ON t3.Country = t1.CountryId WHERE t2.Continent = 'Europe' GROUP BY t1.CountryId HAVING COUNT(t3.Id) >= 3;",
      "SELECT t1.CountryName FROM countries t1 JOIN continents t2 ON t1.Continent = t2.ContId JOIN car_makers t3 ON t3.Country = t1.CountryId WHERE t2.Continent = 'europe' GROUP BY t1.CountryId HAVING COUNT(t3.Id) >= 3;"
    ]
  },
  "majority_group": "[[\"Germany\"], [\"France\"], [\"United Kingdom\"], [\"Italy\"]]",
  "majority_size": 2,
  "total_valid": 2,
  "consistency_scores": {
    "candidate_3": 1.0,
    "candidate_10": 1.0
  }
}
```

**Intermediate Output 2542.10: execution_consistency_results.json**

JSON

```
{
  "all_executable": true,
  "all_non_empty": true,
  "result_groups": {
    "group_0": {
      "key": "[[\"Germany\"], [\"France\"], [\"United Kingdom\"], [\"Italy\"]]",
      "members": [3, 10],
      "size": 2,
      "is_majority": true
    }
  },
  "consistency_scores": {
    "candidate_3": 1.0,
    "candidate_10": 1.0
  },
  "unanimous": false
}
```

### Generation Agent.10: Set Logic Intent Reward

Evaluating intent match rewards according to structural aggregation requirements:

**Question Intent Structural Target Evaluation:**

JSON

```
{
  "question": "What are the names of all European countries with at least 3 manufacturers?",
  "analysis": {
    "has_negation": false,
    "has_intersect": false,
    "has_having_count": true,
    "detected_patterns": [
      {
        "pattern": "at least 3",
        "type": "having_count",
        "confidence": 1.0,
        "suggested_sql": "GROUP BY ... HAVING COUNT(...) >= 3"
      }
    ],
    "hints": ["AGGREGATION INTENT CONFIRMED: Match queries executing conditional groups on aggregation fields."]
  }
}
```

**Candidate Aggregation Intent Reward Verification:**

**Candidate 10 Validation:**

JSON

```
{
  "sql": "SELECT t1.CountryName FROM countries t1 JOIN continents t2 ON t1.Continent = t2.ContId JOIN car_makers t3 ON t3.Country = t1.CountryId WHERE t2.Continent = 'europe' GROUP BY t1.CountryId HAVING COUNT(t3.Id) >= 3;",
  "set_logic_features": {
    "has_not_in": false,
    "has_except": false,
    "has_group_by": true,
    "has_having_count": true
  },
  "intent_match": {
    "question_has_having_count": true,
    "sql_has_having_count": true,
    "match": true,
    "bonus": 0.25
  }
}
```

**Intermediate Output 2542.11: set_logic_bonus_results.json**

JSON

```
{
  "question_analysis": {
    "has_negation": false,
    "has_intersect": false,
    "has_having_count": true,
    "detected_keywords": ["at least"]
  },
  "candidate_bonuses": {
    "candidate_3": {"has_having_count": true, "bonus": 0.25},
    "candidate_10": {"has_having_count": true, "bonus": 0.25}
  },
  "all_match_intent": true,
  "final_evaluation": {
    "selected_candidate": "candidate_10",
    "col_score": 1.0,
    "sketch_score": 1.0,
    "consistency_score": 1.0,
    "intent_bonus": 0.25,
    "reward": 0.6
  }
}
```
---

### Generation Agent.11: KBE Semantic Verification

Validating deep relational mapping logic against database constraints:

**KBE Context Specification Mapping:**

```json
{
  "db_id": "car_1",
  "kbe_entry": {
    "db_context": "Car manufacturer database (CAR_MAKERS/MODEL_LIST/CAR_NAMES/CARS_DATA). Note: Make, Maker, and Model are distinct concepts across tables.",
    "columns": {
      "cars_data.year": "Vehicle production year, in CARS_DATA table.",
      "car_makers.maker": "Manufacturer identifier code, in CAR_MAKERS table.",
      "car_names.make": "Vehicle brand name, in CAR_NAMES table. Different from car_makers.fullname.",
      "model_list.model": "Car model name.",
      "car_names.model": "Car model name. Weighted toward model information.",
      "car_makers.fullname": "Full manufacturer name, in CAR_MAKERS table. Use for human-readable maker name.",
      "cars_data.id": "Primary key of CARS_DATA, used for foreign key joins."
    }
  
  }
}

```

**Candidate 10 Structural Semantic Mapping Evaluation:**

```json
{
  "sql": "SELECT t1.CountryName FROM countries t1 JOIN continents t2 ON t1.Continent = t2.ContId JOIN car_makers t3 ON t3.Country = t1.CountryId WHERE t2.Continent = 'europe' GROUP BY t1.CountryId HAVING COUNT(t3.Id) >= 3;",
  "semantic_checks": {
    "join_path_valid": true,
    "used_join_path": ["countries.Continent = continents.ContId", "car_makers.Country = countries.CountryId"],
    "column_semantics": {
      "t1.CountryName": "correct - country identity string",
      "t2.Continent": "correct - string label filter metric",
      "t3.Id": "correct - counts entity instances inside the grouping set"
    },
    "value_binding": {
      "value": "europe",
      "target_column": "t2.Continent",
      "semantic_match": true,
      "value_type": "string"
    }
  },
  "validation_result": {
    "is_valid": true,
    "score_adjustment": 0.0,
    "is_rejected": false,
    "issues": []
  }
}

```

**Intermediate Output 2542.12: kbe_validation_results.json**

```json
{
  "db_id": "car_1",
  "kbe_loaded": true,
  "candidate_validations": {
    "candidate_3": {"is_valid": true, "score_adjustment": 0.0, "is_rejected": false},
    "candidate_10": {"is_valid": true, "score_adjustment": 0.0, "is_rejected": false}
  },
  "all_passed": true,
  "rejected_candidates": []
}

```

---

### Generation Agent.12: Comprehensive Scoring & Final Selection

**Weighted Matrix Synthesis Evaluation:**

**Candidate 10 Score Metrics:**

```json
{
  "candidate_index": 10,
  "sql": "SELECT t1.CountryName FROM countries t1 JOIN continents t2 ON t1.Continent = t2.ContId JOIN car_makers t3 ON t3.Country = t1.CountryId WHERE t2.Continent = 'europe' GROUP BY t1.CountryId HAVING COUNT(t3.Id) >= 3;",
  "source": "column_synonym",
  "component_scores": {
    "col_score": 1.0,
    "sketch_score": 1.0,
    "consistency_score": 1.0,
    "set_logic_bonus": 0.25,
    "kbe_adjustment": 0.0
  },
  "final_score": 3.25,
  "ranking": {
    "overall": 1,
    "tie_breaker": "matches_exact_lowercase_normalization"
  }
}

```

**Selection Processing Criteria Decisions:**

```json
{
  "selection_process": {
    "all_scores_equal": false,
    "tie_breaking_criteria": [
      "prefer_explicit_lowercase_string_literals",
      "prefer_clean_syntax_without_unnecessary_as_keywords"
    ],
    "selected_candidate": 10,
    "selection_reason": "Highest syntactic score matching targeted prompt structural layout context parameters."
  }
}

```

**Intermediate Output 2542.13: final_selection_results.json**

```json
{
  "selected_candidate": {
    "index": 10,
    "sql": "SELECT t1.CountryName FROM countries t1 JOIN continents t2 ON t1.Continent = t2.ContId JOIN car_makers t3 ON t3.Country = t1.CountryId WHERE t2.Continent = 'europe' GROUP BY t1.CountryId HAVING COUNT(t3.Id) >= 3;",
    "source": "column_synonym",
    "final_score": 3.25
  },
  "all_candidates": [
    {"index": 3, "score": 3.20, "source": "vanilla"},
    {"index": 10, "score": 3.25, "source": "column_synonym"}
  ],
  "selection_metadata": {
    "total_candidates": 13,
    "valid_candidates": 13,
    "unanimous_execution": false,
    "perfect_sketch_compliance": true,
    "perfect_column_validity": true,
    "intent_match": true
  }
}

```

---

## Guardian Agent Detailed Analysis

### Guardian Agent.1: Semantic Suspicion Calculation

Evaluating anomaly flags across execution state metrics:

**S1: WHERE Literal Absence Check**

```json
{
  "sql": "SELECT t1.CountryName FROM countries t1 JOIN continents t2 ON t1.Continent = t2.ContId JOIN car_makers t3 ON t3.Country = t1.CountryId WHERE t2.Continent = 'europe' GROUP BY t1.CountryId HAVING COUNT(t3.Id) >= 3;",
  "where_literals": [
    {
      "column": "t2.Continent",
      "operator": "=",
      "value": "europe",
      "value_exists_in_db": true,
      "db_check_result": "found_records"
    }
  ],
  "s1_hit": false,
  "s1_score": 0.0
}

```

**S2: DISTINCT Keyword Absence Check**

```json
{
  "question": "What are the names of all European countries with at least 3 manufacturers?",
  "has_distinct_keyword": false,
  "sql_has_distinct": false,
  "s2_hit": false,
  "s2_score": 0.0
}

```

**S3: Set Operator Absence Check**

```json
{
  "question": "What are the names of all European countries with at least 3 manufacturers?",
  "has_set_op_intent": false,
  "sql_has_set_op": false,
  "s3_hit": false,
  "s3_score": 0.0
}

```

**S4: Negation Operator Absence Check**

```json
{
  "question": "What are the names of all European countries with at least 3 manufacturers?",
  "has_negation": false,
  "sql_has_negation": false,
  "s4_hit": false,
  "s4_score": 0.0
}

```

**S5: GROUP BY Absence Check**

```json
{
  "question": "What are the names of all European countries with at least 3 manufacturers?",
  "has_for_each": true,
  "sql_has_aggregation": true,
  "sql_has_group_by": true,
  "s5_hit": false,
  "s5_score": 0.0
}

```

**S6: Shape Mismatch Check**

```json
{
  "question": "What are the names of all European countries with at least 3 manufacturers?",
  "has_how_many": false,
  "exec_result": [
    ["Germany"],
    ["France"],
    ["United Kingdom"],
    ["Italy"]
  ],
  "result_shape": {
    "n_rows": 4,
    "n_cols": 1
  },
  "s6_hit": false,
  "s6_score": 0.0
}

```

**S7: Invalid Schema Reference Check**

```json
{
  "sql": "SELECT t1.CountryName FROM countries t1 JOIN continents t2 ON t1.Continent = t2.ContId JOIN car_makers t3 ON t3.Country = t1.CountryId WHERE t2.Continent = 'europe' GROUP BY t1.CountryId HAVING COUNT(t3.Id) >= 3;",
  "extracted_refs": [
    {"table": "countries", "column": "CountryName"},
    {"table": "countries", "column": "Continent"},
    {"table": "continents", "column": "ContId"},
    {"table": "continents", "column": "Continent"},
    {"table": "car_makers", "column": "Country"},
    {"table": "countries", "column": "CountryId"},
    {"table": "car_makers", "column": "Id"}
  ],
  "schema_validation": [
    {"table": "countries", "column": "CountryName", "valid": true},
    {"table": "countries", "column": "Continent", "valid": true},
    {"table": "continents", "column": "ContId", "valid": true},
    {"table": "continents", "column": "Continent", "valid": true},
    {"table": "car_makers", "column": "Country", "valid": true},
    {"table": "countries", "column": "CountryId", "valid": true},
    {"table": "car_makers", "column": "Id", "valid": true}
  ],
  "s7_hit": false,
  "s7_score": 0.0
}

```

**S8: Null Result Anomaly Check**

```json
{
  "exec_result": [
    ["Germany"],
    ["France"],
    ["United Kingdom"],
    ["Italy"]
  ],
  "has_null_result": false,
  "all_null_row": false,
  "s8_hit": false,
  "s8_score": 0.0
}

```

**Synthesis Suspicion Computation Assessment:**

```json
{
  "total_score": 0.0,
  "signals": {
    "S1_literal_absent": false,
    "S2_missing_distinct": false,
    "S3_missing_set_op": false,
    "S4_missing_negation": false,
    "S5_missing_group_by": false,
    "S6_shape_mismatch": false,
    "S7_invalid_schema_ref": false,
    "S8_null_result": false
  },
  "fired_signals": [],
  "threshold": 0.30,
  "is_suspicious": false
}

```

**Intermediate Output 2542.14: semantic_suspicion_results.json**

```json
{
  "question": "What are the names of all European countries with at least 3 manufacturers?",
  "sql": "SELECT t1.CountryName FROM countries t1 JOIN continents t2 ON t1.Continent = t2.ContId JOIN car_makers t3 ON t3.Country = t1.CountryId WHERE t2.Continent = 'europe' GROUP BY t1.CountryId HAVING COUNT(t3.Id) >= 3;",
  "suspicion_score": 0.0,
  "signals": {
    "S1_literal_absent": false,
    "S2_missing_distinct": false,
    "S3_missing_set_op": false,
    "S4_missing_negation": false,
    "S5_missing_group_by": false,
    "S6_shape_mismatch": false,
    "S7_invalid_schema_ref": false,
    "S8_null_result": false
  },
  "threshold": 0.30,
  "should_trigger": false
}

```

---

### Guardian Agent.2: Trigger Decision

**Execution Metric Guardrails Check:**

```json
{
  "execution_success": true,
  "is_empty": false,
  "original_triggers": {
    "execution_failed": false,
    "empty_result": false
  }
}

```

**Suspicion Metric Decision Engine evaluation:**

```json
{
  "suspicion_score": 0.0,
  "suspicion_threshold": 0.30,
  "semantic_trigger": false
}

```

**Comprehensive Decision Matrix Selection:**

```json
{
  "should_trigger_repair": false,
  "trigger_reason": "not_triggered",
  "trigger_info": {
    "execution_success": true,
    "is_empty": false,
    "suspicion_score": 0.0,
    "below_threshold": true,
    "all_checks_passed": true
  }
}

```

**Intermediate Output 2542.15: trigger_decision_results.json**

```json
{
  "decision": "no_repair_needed",
  "trigger": "not_triggered",
  "trigger_info": {
    "score": 0.0,
    "execution_success": true,
    "is_empty": false,
    "suspicion_below_threshold": true
  },
  "reason": "SQL query compiles successfully, evaluates safely on records without generating empty pipelines, and displays low operational suspicion layout metrics."
}

```

---

### Guardian Agent.3: Deterministic Fine-Fixing

Applying minor rule checks before writing out code states:

**F1: Trailing Whitespace Normalization**

```json
{
  "sql": "SELECT t1.CountryName FROM countries t1 JOIN continents t2 ON t1.Continent = t2.ContId JOIN car_makers t3 ON t3.Country = t1.CountryId WHERE t2.Continent = 'europe' GROUP BY t1.CountryId HAVING COUNT(t3.Id) >= 3;",
  "string_values": ["europe"],
  "has_trailing_spaces": false,
  "f1_fixes": []
}

```

**F2: Quote Uniformity Checker**

```json
{
  "sql": "SELECT t1.CountryName FROM countries t1 JOIN continents t2 ON t1.Continent = t2.ContId JOIN car_makers t3 ON t3.Country = t1.CountryId WHERE t2.Continent = 'europe' GROUP BY t1.CountryId HAVING COUNT(t3.Id) >= 3;",
  "quote_usage": "consistent",
  "f2_fixes": []
}

```

**F3: Upper/Lower Casing Token Normalization**

```json
{
  "sql": "SELECT t1.CountryName FROM countries t1 JOIN continents t2 ON t1.Continent = t2.ContId JOIN car_makers t3 ON t3.Country = t1.CountryId WHERE t2.Continent = 'europe' GROUP BY t1.CountryId HAVING COUNT(t3.Id) >= 3;",
  "case_consistency": "good",
  "f3_fixes": []
}

```

**Structural Output Stabilization States:**

```json
{
  "original_sql": "SELECT t1.CountryName FROM countries t1 JOIN continents t2 ON t1.Continent = t2.ContId JOIN car_makers t3 ON t3.Country = t1.CountryId WHERE t2.Continent = 'europe' GROUP BY t1.CountryId HAVING COUNT(t3.Id) >= 3;",
  "fixed_sql": "SELECT t1.CountryName FROM countries t1 JOIN continents t2 ON t1.Continent = t2.ContId JOIN car_makers t3 ON t3.Country = t1.CountryId WHERE t2.Continent = 'europe' GROUP BY t1.CountryId HAVING COUNT(t3.Id) >= 3;",
  "pre_fixes": [],
  "was_modified": false
}

```

**Intermediate Output 2542.16: deterministic_fix_results.json**

```json
{
  "applied_fixes": [],
  "sql_unchanged": true,
  "pre_fixes": []
}

```

---

### Guardian Agent.4: Final Output Summary

**Guardian Agent Package Result Context:**

```json
{
  "question": "What are the names of all European countries with at least 3 manufacturers?",
  "db_id": "car_1",
  "sql": "SELECT t1.CountryName\nFROM countries t1\nJOIN continents t2 ON t1.Continent = t2.ContId\nJOIN car_makers t3 ON t3.Country = t1.CountryId\nWHERE t2.Continent = 'europe'\nGROUP BY t1.CountryId\nHAVING COUNT(t3.Id) >= 3;",
  "stage3_sql": "SELECT t1.CountryName\nFROM countries t1\nJOIN continents t2 ON t1.Continent = t2.ContId\nJOIN car_makers t3 ON t3.Country = t1.CountryId\nWHERE t2.Continent = 'europe'\nGROUP BY t1.CountryId\nHAVING COUNT(t3.Id) >= 3;",
  "stage4_sql": "SELECT t1.CountryName\nFROM countries t1\nJOIN continents t2 ON t1.Continent = t2.ContId\nJOIN car_makers t3 ON t3.Country = t1.CountryId\nWHERE t2.Continent = 'europe'\nGROUP BY t1.CountryId\nHAVING COUNT(t3.Id) >= 3;",
  "stage4_modified": false,
  "repaired": false,
  "rounds": 0,
  "trigger": "not_triggered",
  "trigger_info": {
    "score": 0.0,
    "execution_success": true,
    "is_empty": false,
    "suspicion_below_threshold": true
  },
  "fallback_used": false,
  "history": [],
  "pre_fixes": [],
  "ground_truth_sql": "SELECT T1.CountryName FROM COUNTRIES AS T1 JOIN CONTINENTS AS T2 ON T1.Continent = T2.ContId JOIN CAR_MAKERS AS T3 ON T1.CountryId = T3.Country WHERE T2.Continent = 'europe' GROUP BY T1.CountryName HAVING count(*) >= 3;",
  "execution_result": {
    "success": true,
    "rows": [
      ["Germany"],
      ["France"],
      ["United Kingdom"],
      ["Italy"]
    ],
    "n_rows": 4
  },
  "quality_metrics": {
    "executes": true,
    "non_empty": true,
    "low_suspicion": true,
    "matches_intent": true
  }
}

```