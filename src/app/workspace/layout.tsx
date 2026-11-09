import { HandoverProvider } from '../../lib/store'

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return <HandoverProvider>{children}</HandoverProvider>
}
