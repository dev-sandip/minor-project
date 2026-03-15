#import "lib/lib.typ": *

#coverpage(
  campus: [Purwanchal Campus],
  type: [A Minor Project Proposal  On],
  title: [Real-Time Smart Parking Billing System Using YOLO and OCR],
  by: (
    [PRANIKA ANGDEMBE LIMBU (PUR079BCT051)],
    [RAGHAV UPADHYAY (PUR079BCT057)],
    [SANDIP SAPKOTA (PUR079BCT076)],
    [SULAV POUDEL (PUR079BCT087)]
  ),
  department: [Department of Electronics and Computer Engineering],
  address: [Dharan, Nepal],
  date: [Jan, 2026]
)

#show: document

#include-if-exists("./content/acknowledgement.typ")
#pagebreak()

//#include-if-exists("./content/abstract.typ")
//#pagebreak()

// Customize outline entries
#show outline.entry.where(level: 1): it => {
  v(0pt)
  link(it.element.location())[
    #strong[#it.prefix() #upper[#it.body()]] #h(1fr) #it.page()]
}
#outline()
#pagebreak()

// Reset the outline entries for List of Figures
// = List of Figures
// #show outline.entry: it => link(
//   it.element.location(),
//   it.indented(strong[#it.prefix()], it.inner()),
// )
// #outline(
//   title: none,
//   target: figure,
// )
// #pagebreak()

#include-if-exists("./content/list-of-abbreviations.typ")
#pagebreak()

// Reset page numbering for main content
#set page(numbering: "1")
#counter(page).update(1)
#set heading(
  supplement: [Chapter],
  numbering: "1.1.1.1"
)
#show heading.where(level: 1): it => {
  align(center)[
    #upper[
      #it.supplement #counter(heading).display("1")
      #linebreak()
      #it.body
    ]
  ]
  v(12pt)
}
#show heading.where(level: 2): it => {
  v(6pt)
  [#counter(heading).display("1.1") #it.body]
  v(12pt)
}
#show heading.where(level: 3): it => {
  [#counter(heading).display("1.1.1") #it.body]
  v(6pt)
}

#include-if-exists("./content/introduction.typ")
#pagebreak()

// #include-if-exists("./content/related-theory.typ")
// #pagebreak()

#include-if-exists("./content/literature-review.typ")
#pagebreak()

#include-if-exists("./content/methodology.typ")
#pagebreak()
#include-if-exists("./content/exceptedoutput.typ")
#pagebreak()
#include-if-exists("./content/timeline.typ")
#pagebreak()
//#include-if-exists("./content/current-status.typ")
//#pagebreak()


#set heading(numbering: none)
#show heading.where(level: 1): it => {
  align(center)[
    #upper[#it.body]
  ]
  v(12pt)
}

#include-if-exists("./content/references.typ")
