jest.mock('../src/middleware/auth.middleware', () => ({ authenticate: (req: any, _res: any, next: any) => { req.user = { id: 'staff-1', role: 'RECEPTIONIST' }; next(); } }));
jest.mock('../src/middleware/rbac.middleware', () => ({ requireRole: () => (_req: any, _res: any, next: any) => next() }));
jest.mock('../src/modules/appointments/appointmentRequest.service', () => ({ appointmentRequestService: { approve: jest.fn().mockResolvedValue({ id: 'request-1' }) } }));

import express from 'express';
import request from 'supertest';
import router from '../src/modules/appointments/appointmentRequest.router';
import { appointmentRequestService } from '../src/modules/appointments/appointmentRequest.service';

it('forwards the receptionist selected date and time to approval', async () => {
    const app = express();
    app.use(express.json());
    app.use('/appointment-requests', router);
    await request(app).patch('/appointment-requests/request-1/approve')
        .send({ scheduledDate: '2026-10-23', scheduledTime: '16:30' }).expect(200);
    expect(appointmentRequestService.approve).toHaveBeenCalledWith('request-1', '2026-10-23', '16:30');
});
