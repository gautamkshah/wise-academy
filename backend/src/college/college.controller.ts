import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { CollegeService } from './college.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('colleges')
export class CollegeController {
    constructor(private readonly collegeService: CollegeService) { }

    @Get()
    findAll(@Query('q') query: string) {
        return this.collegeService.findAll(query);
    }

    @UseGuards(AuthGuard)
    @Post()
    create(@Body('name') name: string, @Req() req) {
        if (req.user.role !== 'ADMIN') {
            throw new UnauthorizedException('Admin access required');
        }
        return this.collegeService.create(name);
    }

    @UseGuards(AuthGuard)
    @Delete(':id')
    delete(@Param('id') id: string, @Req() req) {
        if (req.user.role !== 'ADMIN') {
            throw new UnauthorizedException('Admin access required');
        }
        return this.collegeService.delete(id);
    }
}
