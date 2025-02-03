"use client"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@lana/web/ui/card"

import AuditLogsList from "./list"

const AuditLogs: React.FC = () => (
  <>
    <Card>
      <CardHeader>
        <CardTitle>Audit Logs</CardTitle>
        <CardDescription>
          System-wide audit trail showing user and system actions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AuditLogsList />
      </CardContent>
    </Card>
  </>
)

export default AuditLogs
