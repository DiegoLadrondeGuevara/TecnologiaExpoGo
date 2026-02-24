import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class DashboardController {
    constructor(private dashboardService: DashboardService) { }

    @Get('stats')
    getStats(@Request() req: { user: { empresaId: string } }) {
        return this.dashboardService.getStats(req.user.empresaId);
    }
}
