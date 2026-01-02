-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "thoughts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedState" TEXT NOT NULL DEFAULT 'UNPROCESSED',
    "userId" TEXT NOT NULL,
    CONSTRAINT "thoughts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "nextActionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "actions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "actionType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'TODO',
    "projectId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "actions_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "project_thoughts" (
    "projectId" TEXT NOT NULL,
    "thoughtId" TEXT NOT NULL,

    PRIMARY KEY ("projectId", "thoughtId"),
    CONSTRAINT "project_thoughts_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "project_thoughts_thoughtId_fkey" FOREIGN KEY ("thoughtId") REFERENCES "thoughts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "action_thoughts" (
    "actionId" TEXT NOT NULL,
    "thoughtId" TEXT NOT NULL,

    PRIMARY KEY ("actionId", "thoughtId"),
    CONSTRAINT "action_thoughts_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "actions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "action_thoughts_thoughtId_fkey" FOREIGN KEY ("thoughtId") REFERENCES "thoughts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "action_assignees" (
    "actionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    PRIMARY KEY ("actionId", "userId"),
    CONSTRAINT "action_assignees_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "actions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "action_assignees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "thoughts_userId_idx" ON "thoughts"("userId");

-- CreateIndex
CREATE INDEX "thoughts_timestamp_idx" ON "thoughts"("timestamp");

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "projects"("status");

-- CreateIndex
CREATE INDEX "projects_updatedAt_idx" ON "projects"("updatedAt");

-- CreateIndex
CREATE INDEX "actions_projectId_idx" ON "actions"("projectId");

-- CreateIndex
CREATE INDEX "actions_status_idx" ON "actions"("status");

-- CreateIndex
CREATE INDEX "actions_actionType_idx" ON "actions"("actionType");
