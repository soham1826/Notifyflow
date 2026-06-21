import { Router, Request, Response } from "express";
import { prisma } from "@notifyflow/db";
import { authenticateJwt } from "../middleware/supabaseAuth.js";
import { z } from "zod";

const router = Router();

const TemplateInputSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  channel: z.enum(["EMAIL", "WEBHOOK", "IN_APP", "SMS"]),
  subject: z.string().optional().nullable().transform(val => val || null),
  body: z.string().min(1, "Body content is required"),
}).refine(
  (data) => {
    if (data.channel === "EMAIL" && (!data.subject || data.subject.trim().length === 0)) {
      return false;
    }
    return true;
  },
  {
    message: "Subject is required for EMAIL channel templates",
    path: ["subject"],
  }
);

/**
 * GET /api/v1/templates
 * Lists all templates for the tenant.
 */
router.get("/", authenticateJwt, async (req: Request, res: Response) => {
  try {
    const tenant = req.tenant!;
    const templates = await prisma.template.findMany({
      where: { tenantId: tenant.id },
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json(templates);
  } catch (error) {
    console.error("[Templates API] Error loading list:", error);
    return res.status(500).json({ error: "Internal server error listing templates" });
  }
});

/**
 * POST /api/v1/templates
 * Creates a new template.
 */
router.post("/", authenticateJwt, async (req: Request, res: Response) => {
  try {
    const tenant = req.tenant!;
    const parsed = TemplateInputSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const { name, channel, subject, body } = parsed.data;

    // Check unique name per tenant
    const existing = await prisma.template.findFirst({
      where: {
        tenantId: tenant.id,
        name,
      },
    });

    if (existing) {
      return res.status(400).json({ error: `Template name '${name}' is already in use` });
    }

    const template = await prisma.template.create({
      data: {
        tenantId: tenant.id,
        name,
        channel,
        subject,
        body,
      },
    });

    return res.status(201).json(template);
  } catch (error) {
    console.error("[Templates API] Error creating template:", error);
    return res.status(500).json({ error: "Internal server error creating template" });
  }
});

/**
 * PUT /api/v1/templates/:id
 * Updates an existing template.
 */
router.put("/:id", authenticateJwt, async (req: Request, res: Response) => {
  try {
    const tenant = req.tenant!;
    const { id } = req.params;
    const parsed = TemplateInputSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const { name, channel, subject, body } = parsed.data;

    const template = await prisma.template.findFirst({
      where: {
        id,
        tenantId: tenant.id,
      },
    });

    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    // Verify template name remains unique for tenant if changed
    if (name !== template.name) {
      const existing = await prisma.template.findFirst({
        where: {
          tenantId: tenant.id,
          name,
          NOT: { id },
        },
      });

      if (existing) {
        return res.status(400).json({ error: `Template name '${name}' is already in use` });
      }
    }

    const updated = await prisma.template.update({
      where: { id },
      data: {
        name,
        channel,
        subject,
        body,
      },
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error("[Templates API] Error updating template:", error);
    return res.status(500).json({ error: "Internal server error updating template" });
  }
});

/**
 * DELETE /api/v1/templates/:id
 * Deletes a template.
 */
router.delete("/:id", authenticateJwt, async (req: Request, res: Response) => {
  try {
    const tenant = req.tenant!;
    const { id } = req.params;

    const template = await prisma.template.findFirst({
      where: {
        id,
        tenantId: tenant.id,
      },
    });

    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    await prisma.template.delete({
      where: { id },
    });

    return res.status(200).json({ message: "Template deleted successfully" });
  } catch (error) {
    console.error("[Templates API] Error deleting template:", error);
    return res.status(500).json({ error: "Internal server error deleting template" });
  }
});

export default router;
