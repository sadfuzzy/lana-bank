"use client"
import AuditLogsList from "./list"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/ui/card"

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
