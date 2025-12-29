import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { TestimonialService } from './testimonial.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('testimonials')
export class TestimonialController {
    constructor(private readonly testimonialService: TestimonialService) { }

    @UseGuards(AuthGuard)
    @Post()
    create(@Body() createDto: { message: string; rating: number }, @Req() req) {
        // Ideally extract user ID from token
        return this.testimonialService.create({
            user_id: req.body.userId, // Temporary: accept from body or map from token
            ...createDto
        });
    }

    @Get()
    findAll() {
        return this.testimonialService.findAll();
    }
}
