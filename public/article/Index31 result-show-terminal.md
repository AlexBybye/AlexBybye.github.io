# dataset
```
{

        "db_id": "concert_singer",

        "query": "SELECT name FROM stadium EXCEPT SELECT T2.name FROM concert AS T1 JOIN stadium AS T2 ON T1.stadium_id  =  T2.stadium_id WHERE T1.year  =  2014",

        "query_toks": [

            "SELECT",

            "name",

            "FROM",

            "stadium",

            "EXCEPT",

            "SELECT",

            "T2.name",

            "FROM",

            "concert",

            "AS",

            "T1",

            "JOIN",

            "stadium",

            "AS",

            "T2",

            "ON",

            "T1.stadium_id",

            "=",

            "T2.stadium_id",

            "WHERE",

            "T1.year",

            "=",

            "2014"

        ],

        "query_toks_no_value": [

            "select",

            "name",

            "from",

            "stadium",

            "except",

            "select",

            "t2",

            ".",

            "name",

            "from",

            "concert",

            "as",

            "t1",

            "join",

            "stadium",

            "as",

            "t2",

            "on",

            "t1",

            ".",

            "stadium_id",

            "=",

            "t2",

            ".",

            "stadium_id",

            "where",

            "t1",

            ".",

            "year",

            "=",

            "value"

        ],

        "question": "Show names for all stadiums except for stadiums having a concert in year 2014.",

        "question_toks": [

            "Show",

            "names",

            "for",

            "all",

            "stadiums",

            "except",

            "for",

            "stadiums",

            "having",

            "a",

            "concert",

            "in",

            "year",

            "2014",

            "."

        ],

        "sql": {

            "from": {

                "table_units": [

                    [

                        "table_unit",

                        0

                    ]

                ],

                "conds": []

            },

            "select": [

                false,

                [

                    [

                        0,

                        [

                            0,

                            [

                                0,

                                3,

                                false

                            ],

                            null

                        ]

                    ]

                ]

            ],

            "where": [],

            "groupBy": [],

            "having": [],

            "orderBy": [],

            "limit": null,

            "intersect": null,

            "union": null,

            "except": {

                "from": {

                    "table_units": [

                        [

                            "table_unit",

                            2

                        ],

                        [

                            "table_unit",

                            0

                        ]

                    ],

                    "conds": [

                        [

                            false,

                            2,

                            [

                                0,

                                [

                                    0,

                                    18,

                                    false

                                ],

                                null

                            ],

                            [

                                0,

                                1,

                                false

                            ],

                            null

                        ]

                    ]

                },

                "select": [

                    false,

                    [

                        [

                            0,

                            [

                                0,

                                [

                                    0,

                                    3,

                                    false

                                ],

                                null

                            ]

                        ]

                    ]

                ],

                "where": [

                    [

                        false,

                        2,

                        [

                            0,

                            [

                                0,

                                19,

                                false

                            ],

                            null

                        ],

                        2014.0,

                        null

                    ]

                ],

                "groupBy": [],

                "having": [],

                "orderBy": [],

                "limit": null,

                "intersect": null,

                "union": null,

                "except": null

            }

        }

    },
```
# stage 1：
## pseudo_schema.json
```
  {

    "question": "Show names for all stadiums except for stadiums having a concert in year 2014.",

    "db_id": "concert_singer",

    "pseudo": {

      "pseudo_tables": [

        "stadiums",

        "events"

      ],

      "pseudo_columns": [

        "stadium_name",

        "event_type",

        "event_year"

      ]

    }

  },
```
## predictions.json
```
{

    "question": "Show names for all stadiums except for stadiums having a concert in year 2014.",

    "db_id": "concert_singer",

    "prediction": {

      "relevant_tables": [

        "stadium",

        "concert"

      ],

      "relevant_columns": [

        {

          "table": "stadium",

          "column": "Name",

          "reason": "inferred"

        },

        {

          "table": "stadium",

          "column": "Stadium_ID",

          "reason": "inferred"

        },

        {

          "table": "concert",

          "column": "Stadium_ID",

          "reason": "inferred"

        },

        {

          "table": "concert",

          "column": "Year",

          "reason": "inferred"

        }

      ],

      "value_bindings": [

        {

          "value": "2014",

          "value_type": "number",

          "target_column": "YEAR",

          "operator": "=",

          "normalized_form": "2014"

        }

      ],

      "schema_subgraph": {

        "nodes": [

          "stadium",

          "concert"

        ],

        "edges": [

          {

            "from": "concert",

            "to": "stadium",

            "via": "Stadium_ID"

          }

        ]

      }

    },

    "ground_truth": {

      "relevant_tables": [

        "stadium",

        "concert"

      ],

      "relevant_columns": [

        {

          "table": "stadium",

          "column": "Name",

          "reason": "inferred"

        },

        {

          "table": "concert",

          "column": "Stadium_ID",

          "reason": "explicit"

        },

        {

          "table": "stadium",

          "column": "Stadium_ID",

          "reason": "explicit"

        },

        {

          "table": "concert",

          "column": "Year",

          "reason": "explicit"

        }

      ],

      "value_bindings": [

        {

          "value": "2014",

          "value_type": "number",

          "target_column": "T1.year",

          "operator": "=",

          "normalized_form": "2014"

        }

      ],

      "schema_subgraph": {

        "nodes": [

          "stadium",

          "concert"

        ],

        "edges": [

          {

            "from": "concert",

            "to": "stadium",

            "via": "Stadium_ID"

          }

        ]

      }

    }

  },
```
## grounded_candidates.json
```
{

    "question": "Show names for all stadiums except for stadiums having a concert in year 2014.",

    "db_id": "concert_singer",

    "pseudo": {

      "pseudo_tables": [

        "stadiums",

        "events"

      ],

      "pseudo_columns": [

        "stadium_name",

        "event_type",

        "event_year"

      ]

    },

    "candidates": {

      "candidate_tables": [

        "concert",

        "singer",

        "singer_in_concert",

        "stadium"

      ],

      "candidate_columns": [

        "concert.Stadium_ID",

        "concert.Year",

        "concert.concert_Name",

        "singer.Name",

        "singer.Song_Name",

        "singer.Song_release_year",

        "stadium.Name",

        "stadium.Stadium_ID"

      ]

    }

  },
```
# stage2:
## stage2_sketches.json
```
{

    "question": "Show names for all stadiums except for stadiums having a concert in year 2014.",

    "db_id": "concert_singer",

    "stage1_output": {

      "relevant_tables": [

        "stadium",

        "concert"

      ],

      "relevant_columns": [

        {

          "table": "stadium",

          "column": "Name",

          "reason": "inferred"

        },

        {

          "table": "stadium",

          "column": "Stadium_ID",

          "reason": "inferred"

        },

        {

          "table": "concert",

          "column": "Stadium_ID",

          "reason": "inferred"

        },

        {

          "table": "concert",

          "column": "Year",

          "reason": "inferred"

        }

      ],

      "value_bindings": [

        {

          "value": "2014",

          "value_type": "number",

          "target_column": "YEAR",

          "operator": "=",

          "normalized_form": "2014"

        }

      ],

      "schema_subgraph": {

        "nodes": [

          "stadium",

          "concert"

        ],

        "edges": [

          {

            "from": "concert",

            "to": "stadium",

            "via": "Stadium_ID"

          }

        ]

      }

    },

    "sketch": {

      "query_type": "SELECT",

      "select_clause": [

        {

          "item": {

            "type": "column",

            "table": "stadium",

            "column": "name"

          }

        }

      ],

      "from_clause": {

        "tables": [

          "concert",

          "stadium"

        ],

        "join_path": []

      },

      "where_clause": {

        "conditions": [

          {

            "left": {

              "type": "column",

              "table": "stadium",

              "column": "stadium_id"

            },

            "operator": "NOT IN",

            "right": {

              "type": "subquery",

              "description": "stadium_id from concert where year = 2014"

            }

          }

        ],

        "logic": "AND"

      },

      "group_by": null,

      "having": null,

      "order_by": null,

      "limit": null,

      "reasoning": ""

    },

    "ground_truth_sketch": {

      "query_type": "SELECT",

      "select_clause": [

        {

          "item": {

            "type": "column",

            "table": "stadium",

            "column": "name"

          }

        }

      ],

      "from_clause": {

        "tables": [

          "concert",

          "stadium"

        ],

        "join_path": []

      },

      "where_clause": {

        "conditions": [

          {

            "left": {

              "type": "column",

              "table": "stadium",

              "column": "name"

            },

            "operator": "NOT IN",

            "right": {

              "type": "subquery",

              "description": "stadium names from concerts in 2014"

            }

          }

        ],

        "logic": "AND"

      },

      "group_by": null,

      "having": null,

      "order_by": null,

      "limit": null,

      "reasoning": ""

    },

    "original_sql": "SELECT name FROM stadium EXCEPT SELECT T2.name FROM concert AS T1 JOIN stadium AS T2 ON T1.stadium_id  =  T2.stadium_id WHERE T1.year  =  2014",

    "selected_variant": "conservative",

    "verification_score": 0.85

  },
```
# stage3:
## stage3_final_predictions_rescored.json
```
 {

    "question": "Show names for all stadiums except for stadiums having a concert in year 2014.",

    "db_id": "concert_singer",

    "sql": "SELECT stadium.Name\nFROM stadium\nWHERE stadium.Stadium_ID NOT IN (\n  SELECT concert.Stadium_ID\n  FROM concert\n  WHERE concert.Year = 2014\n);",

    "reward": 0.6,

    "all_candidates": [

      {

        "sql": "SELECT stadium.Name\nFROM stadium\nWHERE stadium.Stadium_ID NOT IN (\n  SELECT concert.Stadium_ID\n  FROM concert\n  WHERE concert.Year = 2014\n);",

        "source": "vanilla",

        "col_score": 1.0,

        "sketch_score": 1.0

      },

      {

        "sql": "SELECT s.Name\nFROM stadium s\nWHERE s.Stadium_ID NOT IN (\n  SELECT c.Stadium_ID\n  FROM concert c\n  WHERE c.Year = 2014\n);",

        "source": "vanilla",

        "col_score": 1.0,

        "sketch_score": 1.0

      },

      {

        "sql": "SELECT name \nFROM stadium \nWHERE stadium_id NOT IN (\n    SELECT stadium_id \n    FROM concert \n    WHERE YEAR = 2014\n);",

        "source": "vanilla",

        "col_score": 1.0,

        "sketch_score": 1.0

      },

      {

        "sql": "SELECT name \nFROM stadium \nWHERE stadium_id NOT IN (SELECT stadium_id FROM concert WHERE year = 2014);",

        "source": "set_logic",

        "col_score": 1.0,

        "sketch_score": 1.0

      }

    ],

    "ground_truth_sql": "SELECT name FROM stadium EXCEPT SELECT T2.name FROM concert AS T1 JOIN stadium AS T2 ON T1.stadium_id  =  T2.stadium_id WHERE T1.year  =  2014",

    "num_generated": 4,

    "num_valid": 4

  },
```
## stage3_final_predictions.json
```
{

    "question": "Show names for all stadiums except for stadiums having a concert in year 2014.",

    "db_id": "concert_singer",

    "sql": "SELECT stadium.Name\nFROM stadium\nWHERE stadium.Stadium_ID NOT IN (\n  SELECT concert.Stadium_ID\n  FROM concert\n  WHERE concert.Year = 2014\n);",

    "reward": 0.6,

    "all_candidates": [

      {

        "sql": "SELECT stadium.Name\nFROM stadium\nWHERE stadium.Stadium_ID NOT IN (\n  SELECT concert.Stadium_ID\n  FROM concert\n  WHERE concert.Year = 2014\n);",

        "source": "vanilla",

        "col_score": 1.0,

        "sketch_score": 1.0

      },

      {

        "sql": "SELECT s.Name\nFROM stadium s\nWHERE s.Stadium_ID NOT IN (\n  SELECT c.Stadium_ID\n  FROM concert c\n  WHERE c.Year = 2014\n);",

        "source": "vanilla",

        "col_score": 1.0,

        "sketch_score": 1.0

      },

      {

        "sql": "SELECT name \nFROM stadium \nWHERE stadium_id NOT IN (\n    SELECT stadium_id \n    FROM concert \n    WHERE YEAR = 2014\n);",

        "source": "vanilla",

        "col_score": 1.0,

        "sketch_score": 1.0

      },

      {

        "sql": "SELECT name \nFROM stadium \nWHERE stadium_id NOT IN (SELECT stadium_id FROM concert WHERE year = 2014);",

        "source": "set_logic",

        "col_score": 1.0,

        "sketch_score": 1.0

      }

    ],

    "ground_truth_sql": "SELECT name FROM stadium EXCEPT SELECT T2.name FROM concert AS T1 JOIN stadium AS T2 ON T1.stadium_id  =  T2.stadium_id WHERE T1.year  =  2014",

    "num_generated": 4,

    "num_valid": 4

  },
```
# stage4:
## 
```
{

    "question": "Show names for all stadiums except for stadiums having a concert in year 2014.",

    "db_id": "concert_singer",

    "sql": "SELECT stadium.Name\nFROM stadium\nWHERE stadium.Stadium_ID NOT IN (\n  SELECT concert.Stadium_ID\n  FROM concert\n  WHERE concert.Year = 2014\n);",

    "stage3_sql": "SELECT stadium.Name\nFROM stadium\nWHERE stadium.Stadium_ID NOT IN (\n  SELECT concert.Stadium_ID\n  FROM concert\n  WHERE concert.Year = 2014\n);",

    "stage4_sql": "SELECT stadium.Name\nFROM stadium\nWHERE stadium.Stadium_ID NOT IN (\n  SELECT concert.Stadium_ID\n  FROM concert\n  WHERE concert.Year = 2014\n);",

    "stage4_modified": false,

    "repaired": false,

    "rounds": 0,

    "trigger": "not_triggered",

    "trigger_info": {

      "score": 0.0

    },

    "fallback_used": false,

    "history": [],

    "ground_truth_sql": "SELECT name FROM stadium EXCEPT SELECT T2.name FROM concert AS T1 JOIN stadium AS T2 ON T1.stadium_id  =  T2.stadium_id WHERE T1.year  =  2014"

  },
```