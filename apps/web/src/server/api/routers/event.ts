import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { db } from '@/server/db';
import { z } from 'zod';

export const config = {
  api: {
    responseLimit: false,
  },
};

export const eventRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        projectSlug: z.string(),
        take: z.number().default(100),
        skip: z.number().default(0),
        profileId: z.string().optional(),
        events: z.array(z.string()).optional(),
      })
    )
    .query(
      async ({ input: { take, skip, projectSlug, profileId, events } }) => {
        const project = await db.project.findUniqueOrThrow({
          where: {
            slug: projectSlug,
          },
        });
        return db.event.findMany({
          take,
          skip,
          where: {
            project_id: project.id,
            profile_id: profileId,
            ...(events && events.length > 0
              ? {
                  name: {
                    in: events,
                  },
                }
              : {}),
          },
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            profile: true,
          },
        });
      }
    ),
});
