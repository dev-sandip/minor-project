= Project Timeline
The following gantt chart shows our planned project timeline until the Final Presentation.


// #figure(
//   [
//     #set par(leading: 0.5em)
//     #import "@preview/timeliney:0.3.0"

//     #timeliney.timeline(
//       show-grid: true,
//       {
//         import timeliney: *

//         // ---- Header (like your image) ----
//         // 0..4 is split into 4 equal blocks = your 4 date ranges
//         headerline(group(([*Jan*], 3)), group(([*Feb*], 1)))
//         headerline(
//           group([*Jan 1–Jan 15*], [*Jan 16–Jan 29*], [*Jan 30–Feb 14*], [*Feb 14–Feb 29*]),
//         )

//         // ---- Tasks (bars) ----
//         // Use thick grey strokes to look like the sample gantt
//         taskgroup(title: [*TASKS*], {
//           task(
//             "Requirement analysis",
//             (0.10, 0.90),
//             style: (stroke: 6pt + gray),
//           )

//           task(
//             "Dataset collection",
//             (0.50, 1.50),
//             style: (stroke: 6pt + gray),
//           )

//           task(
//             "Website Development",
//             (1.10, 2.00),
//             style: (stroke: 6pt + gray),
//           )

//           task(
//             "Model Training",
//             (1.60, 2.60),
//             style: (stroke: 6pt + gray),
//           )

//           task(
//             "Testing and debugging",
//             (2.70, 3.30),
//             style: (stroke: 6pt + gray),
//           )

//           task(
//             "Deployment",
//             (3.10, 3.80),
//             style: (stroke: 6pt + gray),
//           )
//         })
//       },
//     )
//   ],
//   caption: "Gantt Chart",
// )
// #figure(
//   image("images/gantchart.png", width: 100%),
//   caption: [Gantt chart]
// )
 #figure(
  [
    #set text(size: 10pt)
    #set par(leading: 0.5em)
    
    #table(
      columns: (auto, 1fr),
      stroke: none,
      inset: 8pt,
      align: (left, left),
      
      // Header row with months
      table.cell(colspan: 1, []),
      table.cell(
        colspan: 1,
        align: center,
        [
          #table(
            columns: (3fr, 1fr),
            stroke: (x, y) => if y == 0 { (bottom: 1pt) } else { none },
            inset: 8pt,
            align: center,
            [*Jan*], [*Feb*],
          )
        ]
      ),
      
      // Subheader row with date ranges
      table.cell(colspan: 1, []),
      table.cell(
        colspan: 1,
        [
          #table(
            columns: (1fr, 1fr, 1fr, 1fr),
            stroke: (x, y) => if y == 0 { (bottom: 0.5pt) } else { none },
            inset: (x: 4pt, y: 6pt),
            align: center,
            [Jan 1–Jan 15], [Jan 16–Jan 29], [Jan 30–Feb 14], [Feb 14–Feb 29],
          )
        ]
      ),
      
      // Tasks section
      table.cell(colspan: 2, align: left, [*TASKS*]),
      
      // Task 1: Requirement analysis
      [Requirement analysis],
      [
        #block(
          width: 100%,
          height: 12pt,
          [
            #place(left + horizon, dx: 8.75%, box(width: 20%, height: 8pt, fill: gray))
          ]
        )
      ],
      
      // Task 2: Dataset collection
      [Dataset collection],
      [
        #block(
          width: 100%,
          height: 12pt,
          [
            #place(left + horizon, dx: 30%, box(width: 23%, height: 8pt, fill: gray))
          ]
        )
      ],
      
      // Task 3: Website Development
      [Website Development],
      [
        #block(
          width: 100%,
          height: 12pt,
          [
            #place(left + horizon, dx: 52%, box(width: 20%, height: 8pt, fill: gray))
          ]
        )
      ],
      
      // Task 4: Model Training
      [Model Training],
      [
        #block(
          width: 100%,
          height: 12pt,
          [
            #place(left + horizon, dx: 58%, box(width: 25%, height: 8pt, fill: gray))
          ]
        )
      ],
      
      // Task 5: Testing and debugging
      [Testing and debugging],
      [
        #block(
          width: 100%,
          height: 12pt,
          [
            #place(left + horizon, dx: 78%, box(width: 13%, height: 8pt, fill: gray))
          ]
        )
      ],
      
      // Task 6: Deployment
      [Deployment],
      [
        #block(
          width: 100%,
          height: 12pt,
          [
            #place(left + horizon, dx: 84%, box(width: 14%, height: 8pt, fill: gray))
          ]
        )
      ],
    )
  ],
  caption: [Gantt Chart]
)