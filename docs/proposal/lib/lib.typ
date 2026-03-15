// lib.typ - Typst Template for Academic Documents
// Main document template function
#let document(
  body
) = {
  // Document settings
  set page(
    paper: "a4",
    margin: (left: 3.81cm, right: 2.54cm, top: 2.5cm, bottom: 2.54cm),
    numbering: "i",
    number-align: center,
  )
  
  // Font settings
  set text(
    font: "Libertinus Serif",
    size: 12pt,
    lang: "en"
  )

  // Heading settings
  show heading.where(level: 1): it => {
    align(center)[
        #upper(it.body)
    ]
    v(24pt)
  }

  set heading(
    supplement: [Chapter],
  )
  
  // Paragraph settings
  set par(
    leading: 1.2em,
  // leading: 1.2em,
    spacing: 20pt,
    first-line-indent: 0pt,
    justify: true
  )
  
  // Figure and table numbering
  set figure(numbering: "1.1")
  
  body
}

// Function to create cover page
#let coverpage(
  campus: [],
  type: [],
  title: [],
  by: (),
  department: [],
  address: [],
  date: [],
) = {
  page(numbering: none, [
    #set align(center)

    #image("TULogo.png", width: 20%)
    #v(1.2cm)

    // University header
    #text(size: 14pt, weight: "bold")[
      TRIBHUVAN UNIVERSITY \
      INSTITUTE OF ENGINEERING \
      #upper(campus) \
    ]

    #v(2cm)

    // Project type and title
    #text(size: 14pt, weight: "bold")[
      #upper(type) \
      #v(0.5cm)
      #upper(title)
    ]

    #v(1.8cm)

    // Authors section
    #text(size: 14pt, weight: "bold")[
      BY \
      #v(0.3cm)
      #for author in by [
        #author \
      ]
    ]

    #v(1.2cm)

    // Department and address
    #align(horizon, [
    #text(size: 13pt, weight: "bold")[
      #upper(department) \
      #upper(campus) \
      #upper(address) \
    ]])

    // Date
    #align(bottom, [
      #text(size: 13pt, weight: "bold")[
        #upper(date)
      ]])
  ])
}


// To conditionally include files with path resolution
#let include-if-exists(path) = context {
  // Adjust path to be relative to the calling file, not this lib file
  let adjusted-path = if path.starts-with("./") {
    "../" + path.slice(2)
  } else if not path.starts-with("../") and not path.starts-with("/") {
    "../" + path
  } else {
    path
  }
  
  let path-label = label(adjusted-path)
  let first-time = query((context {}).func()).len() == 0
  if first-time or query(path-label).len() > 0 {
    [
      #include adjusted-path 
      #path-label
    ]
  }
}
