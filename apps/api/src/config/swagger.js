export const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'EduOMR API',
    version: '0.1.0',
    description: 'Enterprise Education Management SaaS — exam creation, digital OMR, auto-scoring, result release, WhatsApp notifications.',
    contact: { name: 'EduOMR Support', email: 'support@eduomr.com' },
  },
  servers: [
    { url: '/api/v1', description: 'API v1' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: { type: 'object', nullable: true },
          meta: {
            type: 'object',
            properties: {
              requestId: { type: 'string' },
              timestamp: { type: 'string', format: 'date-time' },
              pagination: {
                type: 'object',
                properties: {
                  page: { type: 'integer' },
                  limit: { type: 'integer' },
                  total: { type: 'integer' },
                  totalPages: { type: 'integer' },
                  hasNext: { type: 'boolean' },
                  hasPrev: { type: 'boolean' },
                },
              },
            },
          },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
              details: { type: 'object' },
              timestamp: { type: 'string' },
              requestId: { type: 'string' },
            },
          },
        },
      },
      Institution: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          address: { type: 'string' },
          contactEmail: { type: 'string', format: 'email' },
          contactPhone: { type: 'string' },
          status: { type: 'string', enum: ['pending', 'active', 'suspended'] },
          settings: { type: 'object' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      SubscriptionPlan: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          price: { type: 'number' },
          durationDays: { type: 'integer' },
          maxStudents: { type: 'integer' },
          maxTeachers: { type: 'integer' },
          features: { type: 'array', items: { type: 'string' } },
          isActive: { type: 'boolean' },
        },
      },
      PaymentUpload: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          tenantId: { type: 'string', format: 'uuid' },
          planId: { type: 'string', format: 'uuid' },
          utrNumber: { type: 'string' },
          amount: { type: 'number' },
          screenshotUrl: { type: 'string' },
          status: { type: 'string', enum: ['pending', 'APPROVED', 'REJECTED'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Subscription: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          tenantId: { type: 'string', format: 'uuid' },
          planId: { type: 'string', format: 'uuid' },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          status: { type: 'string', enum: ['active', 'expired', 'cancelled'] },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          tenantId: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          phone: { type: 'string' },
          role: { type: 'string', enum: ['platform_owner', 'super_admin', 'admin', 'teacher', 'student', 'parent'] },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Exam: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          tenantId: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          description: { type: 'string' },
          examMode: { type: 'string', enum: ['DIGITAL', 'PHYSICAL_PAPER'] },
          totalMarks: { type: 'integer' },
          marksPerCorrect: { type: 'number' },
          marksPerWrong: { type: 'number' },
          negativeMarking: { type: 'boolean' },
          durationMinutes: { type: 'integer' },
          status: { type: 'string', enum: ['DRAFT', 'PUBLISHED', 'IN_PROGRESS', 'COMPLETED'] },
          scheduledAt: { type: 'string', format: 'date-time' },
          deadlineAt: { type: 'string', format: 'date-time' },
          classId: { type: 'string', format: 'uuid' },
          subjectId: { type: 'string', format: 'uuid' },
          createdBy: { type: 'string', format: 'uuid' },
          resultReleased: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Question: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          examId: { type: 'string', format: 'uuid' },
          questionText: { type: 'string' },
          options: {
            type: 'array',
            items: {
              type: 'object',
              properties: { label: { type: 'string' }, text: { type: 'string' } },
            },
          },
          correctOption: { type: 'string' },
          marks: { type: 'number' },
          orderIndex: { type: 'integer' },
        },
      },
      AnswerKey: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          examId: { type: 'string', format: 'uuid' },
          entries: { type: 'object' },
          version: { type: 'integer' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      ExamSession: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          examId: { type: 'string', format: 'uuid' },
          studentId: { type: 'string', format: 'uuid' },
          status: { type: 'string', enum: ['in_progress', 'submitted'] },
          startedAt: { type: 'string', format: 'date-time' },
          submittedAt: { type: 'string', format: 'date-time' },
        },
      },
      Result: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          examSessionId: { type: 'string', format: 'uuid' },
          examId: { type: 'string', format: 'uuid' },
          studentId: { type: 'string', format: 'uuid' },
          totalScore: { type: 'number' },
          totalMarks: { type: 'number' },
          correctCount: { type: 'integer' },
          wrongCount: { type: 'integer' },
          skippedCount: { type: 'integer' },
          percentage: { type: 'number' },
          rank: { type: 'integer' },
          isReleased: { type: 'boolean' },
          breakdown: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                questionId: { type: 'string' },
                studentAnswer: { type: 'string' },
                correctAnswer: { type: 'string' },
                isCorrect: { type: 'boolean' },
                marksAwarded: { type: 'number' },
              },
            },
          },
        },
      },
      AcademicYear: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          isCurrent: { type: 'boolean' },
        },
      },
      Class: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          academicYearId: { type: 'string', format: 'uuid' },
        },
      },
      Section: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          classId: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
        },
      },
      Subject: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          classId: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          code: { type: 'string' },
        },
      },
      Enrollment: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          studentId: { type: 'string', format: 'uuid' },
          classId: { type: 'string', format: 'uuid' },
          sectionId: { type: 'string', format: 'uuid' },
          academicYearId: { type: 'string', format: 'uuid' },
          isActive: { type: 'boolean' },
        },
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register new institution + admin',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['institutionName', 'adminEmail', 'adminPassword', 'adminFirstName'],
                properties: {
                  institutionName: { type: 'string' },
                  adminEmail: { type: 'string', format: 'email' },
                  adminPassword: { type: 'string', minLength: 8 },
                  adminFirstName: { type: 'string' },
                  adminLastName: { type: 'string' },
                  contactPhone: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Institution + admin created', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Sign in (all roles)',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['email', 'password'], properties: { email: { type: 'string' }, password: { type: 'string' } } } } },
        },
        responses: { '200': { description: 'Tokens + user profile' }, '401': { description: 'Invalid credentials' } },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Rotate refresh token',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['refreshToken'], properties: { refreshToken: { type: 'string' } } } } } },
        responses: { '200': { description: 'New access + refresh tokens' } },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Revoke refresh token',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['refreshToken'], properties: { refreshToken: { type: 'string' } } } } } },
        responses: { '200': { description: 'Logged out' } },
      },
    },
    '/institutions': {
      get: {
        tags: ['Institutions'],
        summary: 'List all institutions (super_admin)',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Institution list' } },
      },
    },
    '/institutions/{id}': {
      get: {
        tags: ['Institutions'], summary: 'Get institution by ID', security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'Institution details' } },
      },
      patch: {
        tags: ['Institutions'], summary: 'Update institution', security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'Updated institution' } },
      },
      delete: {
        tags: ['Institutions'], summary: 'Delete institution', security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Deleted' } },
      },
    },
    '/plans': {
      get: { tags: ['Subscription Plans'], summary: 'List subscription plans', responses: { '200': { description: 'Plan list' } } },
      post: { tags: ['Subscription Plans'], summary: 'Create plan (super_admin)', security: [{ bearerAuth: [] }], responses: { '201': { description: 'Plan created' } } },
    },
    '/plans/{id}': {
      get: { tags: ['Subscription Plans'], summary: 'Get plan by ID', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Plan details' } } },
      patch: { tags: ['Subscription Plans'], summary: 'Update plan', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Updated' } } },
      delete: { tags: ['Subscription Plans'], summary: 'Delete plan', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Deleted' } } },
    },
    '/payments/upload': {
      post: { tags: ['Payments'], summary: 'Upload payment proof (admin)', security: [{ bearerAuth: [] }], responses: { '201': { description: 'Payment uploaded' } } },
    },
    '/payments': {
      get: { tags: ['Payments'], summary: 'List payments', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Payment list' } } },
    },
    '/payments/{id}/verify': {
      patch: { tags: ['Payments'], summary: 'Verify/reject payment (super_admin)', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Verified' } } },
    },
    '/subscriptions': {
      get: { tags: ['Subscriptions'], summary: 'Get active subscription', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Subscription details' } } },
    },
    '/teachers': {
      get: { tags: ['Teacher Management'], summary: 'List teachers', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Teacher list' } } },
      post: { tags: ['Teacher Management'], summary: 'Create teacher', security: [{ bearerAuth: [] }], responses: { '201': { description: 'Teacher created' } } },
    },
    '/teachers/{id}': {
      get: { tags: ['Teacher Management'], summary: 'Get teacher', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Teacher details' } } },
      patch: { tags: ['Teacher Management'], summary: 'Update teacher', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Updated' } } },
      delete: { tags: ['Teacher Management'], summary: 'Delete teacher', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Deleted' } } },
    },
    '/students': {
      get: { tags: ['Student Management'], summary: 'List students', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Student list' } } },
      post: { tags: ['Student Management'], summary: 'Create student', security: [{ bearerAuth: [] }], responses: { '201': { description: 'Student created' } } },
    },
    '/students/{id}': {
      get: { tags: ['Student Management'], summary: 'Get student', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Student details' } } },
      patch: { tags: ['Student Management'], summary: 'Update student', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Updated' } } },
      delete: { tags: ['Student Management'], summary: 'Delete student', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Deleted' } } },
    },
    '/parents': {
      get: { tags: ['Parent Management'], summary: 'List parents', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Parent list' } } },
      post: { tags: ['Parent Management'], summary: 'Create parent', security: [{ bearerAuth: [] }], responses: { '201': { description: 'Parent created' } } },
    },
    '/parents/{id}': {
      get: { tags: ['Parent Management'], summary: 'Get parent', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Parent details' } } },
      patch: { tags: ['Parent Management'], summary: 'Update parent', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Updated' } } },
      delete: { tags: ['Parent Management'], summary: 'Delete parent', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Deleted' } } },
    },
    '/parents/{id}/children': {
      get: { tags: ['Parent Management'], summary: 'List linked children', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Children list' } } },
      post: { tags: ['Parent Management'], summary: 'Link student to parent', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '201': { description: 'Linked' } } },
    },
    '/parents/{id}/children/{studentId}': {
      delete: { tags: ['Parent Management'], summary: 'Unlink student', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }, { name: 'studentId', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Unlinked' } } },
    },
    '/users/profile': {
      get: { tags: ['User Profile'], summary: 'Get own profile', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Profile' } } },
      patch: { tags: ['User Profile'], summary: 'Update profile', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Updated profile' } } },
    },
    '/users/profile/change-password': {
      post: { tags: ['User Profile'], summary: 'Change password', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Password changed' } } },
    },
    '/academic/years': {
      get: { tags: ['Academic'], summary: 'List academic years', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Year list' } } },
      post: { tags: ['Academic'], summary: 'Create academic year', security: [{ bearerAuth: [] }], responses: { '201': { description: 'Created' } } },
    },
    '/academic/years/{id}': {
      get: { tags: ['Academic'], summary: 'Get academic year', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Year details' } } },
      patch: { tags: ['Academic'], summary: 'Update academic year', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Updated' } } },
      delete: { tags: ['Academic'], summary: 'Delete academic year', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Deleted' } } },
    },
    '/academic/classes': {
      get: { tags: ['Academic'], summary: 'List classes', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Class list' } } },
      post: { tags: ['Academic'], summary: 'Create class', security: [{ bearerAuth: [] }], responses: { '201': { description: 'Created' } } },
    },
    '/academic/classes/{id}': {
      get: { tags: ['Academic'], summary: 'Get class', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Class details' } } },
      patch: { tags: ['Academic'], summary: 'Update class', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Updated' } } },
      delete: { tags: ['Academic'], summary: 'Delete class', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Deleted' } } },
    },
    '/academic/classes/{classId}/sections': {
      get: { tags: ['Academic'], summary: 'List sections', security: [{ bearerAuth: [] }], parameters: [{ name: 'classId', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Section list' } } },
    },
    '/academic/sections': {
      post: { tags: ['Academic'], summary: 'Create section', security: [{ bearerAuth: [] }], responses: { '201': { description: 'Created' } } },
    },
    '/academic/sections/{id}': {
      patch: { tags: ['Academic'], summary: 'Update section', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Updated' } } },
      delete: { tags: ['Academic'], summary: 'Delete section', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Deleted' } } },
    },
    '/academic/classes/{classId}/subjects': {
      get: { tags: ['Academic'], summary: 'List subjects', security: [{ bearerAuth: [] }], parameters: [{ name: 'classId', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Subject list' } } },
    },
    '/academic/subjects': {
      post: { tags: ['Academic'], summary: 'Create subject', security: [{ bearerAuth: [] }], responses: { '201': { description: 'Created' } } },
    },
    '/academic/subjects/{id}': {
      patch: { tags: ['Academic'], summary: 'Update subject', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Updated' } } },
      delete: { tags: ['Academic'], summary: 'Delete subject', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Deleted' } } },
    },
    '/academic/enrollments': {
      get: { tags: ['Academic'], summary: 'List enrollments', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Enrollment list' } } },
      post: { tags: ['Academic'], summary: 'Create enrollment', security: [{ bearerAuth: [] }], responses: { '201': { description: 'Created' } } },
    },
    '/academic/enrollments/{id}': {
      delete: { tags: ['Academic'], summary: 'Delete enrollment', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Deleted' } } },
    },
    '/exams': {
      get: { tags: ['Exams'], summary: 'List exams (teacher)', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Exam list' } } },
      post: {
        tags: ['Exams'], summary: 'Create exam', security: [{ bearerAuth: [] }],
        requestBody: {
          required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Exam' } } },
        },
        responses: { '201': { description: 'Exam created' } },
      },
    },
    '/exams/{id}': {
      get: { tags: ['Exams'], summary: 'Get exam', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Exam details' } } },
      patch: { tags: ['Exams'], summary: 'Update exam', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Updated' } } },
      delete: { tags: ['Exams'], summary: 'Delete exam', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Deleted' } } },
    },
    '/exams/{id}/publish': {
      post: { tags: ['Exams'], summary: 'Publish exam', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Published' } } },
    },
    '/exams/{id}/pdf': {
      get: { tags: ['Exams'], summary: 'Download question paper PDF (Mode 2)', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'PDF file' } } },
    },
    '/questions/exam/{examId}': {
      get: { tags: ['Questions'], summary: 'List questions for exam', security: [{ bearerAuth: [] }], parameters: [{ name: 'examId', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Question list' } } },
      post: { tags: ['Questions'], summary: 'Bulk create questions', security: [{ bearerAuth: [] }], parameters: [{ name: 'examId', in: 'path', required: true, schema: { type: 'string' } }], responses: { '201': { description: 'Questions created' } } },
    },
    '/questions/{id}': {
      patch: { tags: ['Questions'], summary: 'Update question', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Updated' } } },
      delete: { tags: ['Questions'], summary: 'Delete question', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Deleted' } } },
    },
    '/answer-keys/exam/{examId}': {
      get: { tags: ['Answer Keys'], summary: 'Get answer key', security: [{ bearerAuth: [] }], parameters: [{ name: 'examId', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Answer key' } } },
      put: {
        tags: ['Answer Keys'], summary: 'Upload answer key', security: [{ bearerAuth: [] }],
        parameters: [{ name: 'examId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { answers: { type: 'array', items: { type: 'object', properties: { questionNumber: { type: 'integer' }, correctOption: { type: 'string' } } } } } } } } },
        responses: { '200': { description: 'Uploaded' } },
      },
      delete: { tags: ['Answer Keys'], summary: 'Delete answer key', security: [{ bearerAuth: [] }], parameters: [{ name: 'examId', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Deleted' } } },
    },
    '/exam-sessions/{examId}/start': {
      post: { tags: ['Exam Sessions'], summary: 'Start exam session (student)', security: [{ bearerAuth: [] }], parameters: [{ name: 'examId', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Session started with questions' } } },
    },
    '/exam-sessions/{examId}/omr': {
      get: { tags: ['Exam Sessions'], summary: 'Get OMR data (Mode 2)', security: [{ bearerAuth: [] }], parameters: [{ name: 'examId', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OMR grid data (no questions)' } } },
    },
    '/exam-sessions/{examId}/active': {
      get: { tags: ['Exam Sessions'], summary: 'Get active sessions (teacher monitor)', security: [{ bearerAuth: [] }], parameters: [{ name: 'examId', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Active session list' } } },
    },
    '/submissions/{sessionId}/save': {
      post: { tags: ['Submissions'], summary: 'Save single answer (auto-save)', security: [{ bearerAuth: [] }], parameters: [{ name: 'sessionId', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Saved' } } },
    },
    '/submissions/{sessionId}/bulk-save': {
      post: { tags: ['Submissions'], summary: 'Bulk save answers', security: [{ bearerAuth: [] }], parameters: [{ name: 'sessionId', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Saved' } } },
    },
    '/submissions/{sessionId}/submit': {
      post: { tags: ['Submissions'], summary: 'Submit exam (manual or auto)', security: [{ bearerAuth: [] }], parameters: [{ name: 'sessionId', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Submitted with score' } } },
    },
    '/submissions/{sessionId}/summary': {
      get: { tags: ['Submissions'], summary: 'Get submission summary', security: [{ bearerAuth: [] }], parameters: [{ name: 'sessionId', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Summary' } } },
    },
    '/results/exam/{examId}/release': {
      post: { tags: ['Results'], summary: 'Release results + trigger notifications', security: [{ bearerAuth: [] }], parameters: [{ name: 'examId', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Results released' } } },
    },
    '/results/exam/{examId}/my': {
      get: { tags: ['Results'], summary: 'Get my result for exam (student)', security: [{ bearerAuth: [] }], parameters: [{ name: 'examId', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'My result' } } },
    },
    '/results/exam/{examId}': {
      get: { tags: ['Results'], summary: 'List all results (teacher)', security: [{ bearerAuth: [] }], parameters: [{ name: 'examId', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Result list' } } },
    },
    '/results/exam/{examId}/leaderboard': {
      get: { tags: ['Results'], summary: 'Get leaderboard', security: [{ bearerAuth: [] }], parameters: [{ name: 'examId', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Leaderboard' } } },
    },
    '/results/exam/{examId}/analytics': {
      get: { tags: ['Results'], summary: 'Get exam analytics', security: [{ bearerAuth: [] }], parameters: [{ name: 'examId', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Analytics' } } },
    },
    '/results/{id}': {
      get: { tags: ['Results'], summary: 'Get result by session ID', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Result with per-question breakdown' } } },
    },
    '/notifications/exam/{examId}/send-results': {
      post: { tags: ['Notifications'], summary: 'Send result notifications (WhatsApp → email fallback)', security: [{ bearerAuth: [] }], parameters: [{ name: 'examId', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Notifications queued' } } },
    },
    '/health': {
      get: { tags: ['Health'], summary: 'Health check', responses: { '200': { description: 'API status' } } },
    },
  },
};
