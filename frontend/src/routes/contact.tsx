import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/contact')({
  component: ContactPage,
})

const TEAM = [
  {
    name: 'Sandip Sapkota',
    role: 'Full Stack Developer',
    image: 'https://ik.imagekit.io/vsthqhvci/headshots/137697928.jpeg',
    github: 'https://github.com/dev-sandip',
  },
  {
    name: 'Raghav Upadhyay',
    role: 'Machine Learning Engineer',
    image: 'http://github.com/raghavbot.png',
    github: 'https://github.com/raghavbot',
  },
  {
    name: 'Pranik Angdembe Limbu',
    role: 'App Developer(Flutter)',
    image: 'https://api.dicebear.com/9.x/initials/svg?seed=Member%20Three',
    github: 'https://github.com/pranikalimbu',
  },
  {
    name: 'Sulav Paudel',
    role: 'Web Developer',
    image: 'https://ik.imagekit.io/vsthqhvci/headshots/Messenger_creation_14C89AD1-8362-49D9-9ABC-C1D1BD84A028.jpeg',
    github: 'https://github.com/Sulav18',
  },
]

function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-lg font-medium text-foreground">Contact & team</h1>
        <p className="text-xs text-muted-foreground">
          Built for Nepali parking operators. Reach out to the team behind the system.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {TEAM.map((member) => (
          <Card key={member.name} className="border-border">
            <CardHeader className="items-center gap-2">
              <img
                src={member.image}
                alt={member.name}
                className="h-14 w-14 rounded-full border border-border object-cover"
              />
              <CardTitle className="text-xs font-medium text-center">
                {member.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-2">
              <p className="text-[11px] text-muted-foreground">{member.role}</p>
              <Button
                size="xs"
                variant="outline"
                className="text-[11px]"
              >
                <a href={member.github} target="_blank" rel="noreferrer">
                  View GitHub
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

